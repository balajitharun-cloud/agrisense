#!/usr/bin/env python3
"""
Generate frontend/src/data/karnatakaMap.js from the Census-2011 district
shapefile (30 Karnataka districts, WGS84).

Source data:
  https://github.com/datameet/maps/tree/master/Districts/Census_2011
  files: 2011_Dist.shp / .dbf / .shx / .prj

Usage:
  mkdir -p /tmp/dist2011 && for e in shp dbf shx prj; do \
    curl -o /tmp/dist2011/2011_Dist.$e \
    https://raw.githubusercontent.com/datameet/maps/master/Districts/Census_2011/2011_Dist.$e; done
  pip install pyshp
  python3 scripts/build-karnataka-map.py /tmp/dist2011/2011_Dist.shp

Why Census 2011 rather than the older geohacker geojson: that one predates the
2007 district split and omits Yadgir / Chikkaballapura / Ramanagara, which left
visible holes in the state outline. Census 2011 has all 30 districts, so the
four revenue divisions tile Karnataka with no gaps.

Pipeline: read shapefile -> filter Karnataka -> assign districts to a revenue
division -> simplify rings (RDP) -> project to SVG coordinates -> emit JS.
"""

import json
import math
import os
import sys

# Karnataka's four revenue divisions.
DIVISIONS = {
    "bengaluru": {
        "name": "Bengaluru Division",
        "local": {"kn": "ಬೆಂಗಳೂರು ವಿಭಾಗ", "hi": "बेंगलुरु मंडल"},
        "districts": [
            "Bangalore", "Bangalore Rural", "Chikkaballapura", "Chitradurga",
            "Davanagere", "Kolar", "Ramanagara", "Shimoga", "Tumkur",
        ],
    },
    "mysuru": {
        "name": "Mysuru Division",
        "local": {"kn": "ಮೈಸೂರು ವಿಭಾಗ", "hi": "मैसूरु मंडल"},
        "districts": [
            "Chamrajnagar", "Chikmagalur", "Dakshina Kannada", "Hassan",
            "Kodagu", "Mandya", "Mysore", "Udupi", "Uttara Kannada",
        ],
    },
    "belagavi": {
        "name": "Belagavi Division",
        "local": {"kn": "ಬೆಳಗಾವಿ ವಿಭಾಗ", "hi": "बेलगावी मंडल"},
        "districts": ["Bagalkot", "Belgaum", "Bijapur", "Dharwad", "Gadag", "Haveri"],
    },
    "kalaburagi": {
        "name": "Kalaburagi Division",
        "local": {"kn": "ಕಲಬುರಗಿ ವಿಭಾಗ", "hi": "कलबुरगी मंडल"},
        "districts": ["Bellary", "Bidar", "Gulbarga", "Koppal", "Raichur", "Yadgir"],
    },
}

# Current official spellings for the source names.
DISPLAY = {
    "Bangalore": "Bengaluru Urban",
    "Bangalore Rural": "Bengaluru Rural",
    "Belgaum": "Belagavi",
    "Bellary": "Ballari",
    "Bijapur": "Vijayapura",
    "Chamrajnagar": "Chamarajanagar",
    "Chikmagalur": "Chikkamagaluru",
    "Dakshina Kannada": "Dakshina Kannada",
    "Gulbarga": "Kalaburagi",
    "Mysore": "Mysuru",
    "Shimoga": "Shivamogga",
    "Tumkur": "Tumakuru",
    "Uttara Kannada": "Uttara Kannada",
}

VIEW_W, VIEW_H = 640, 820
PADDING = 14


def district_to_division(name):
    for div_id, div in DIVISIONS.items():
        if name in div["districts"]:
            return div_id
    return None


def rdp(points, eps):
    """Ramer-Douglas-Peucker simplification."""
    if len(points) < 3:
        return points
    (x1, y1), (x2, y2) = points[0], points[-1]
    dx, dy = x2 - x1, y2 - y1
    norm = math.hypot(dx, dy)
    if norm < 1e-9:
        # Degenerate baseline (closed ring whose ends coincide).
        far = max(range(len(points)), key=lambda i: math.hypot(points[i][0] - x1, points[i][1] - y1))
        if far == 0 or far == len(points) - 1:
            return [points[0], points[-1]]
        idx, max_d = far, 1.0
    else:
        max_d, idx = -1.0, 0
        for i in range(1, len(points) - 1):
            px, py = points[i]
            d = abs(dy * (px - x1) - dx * (py - y1)) / norm
            if d > max_d:
                max_d, idx = d, i
    if max_d > eps:
        left = rdp(points[: idx + 1], eps)
        right = rdp(points[idx:], eps)
        return left[:-1] + right
    return [points[0], points[-1]]


def rings_from_shape(shape):
    """Split a pyshp shape into its individual rings."""
    pts = shape.points
    parts = list(shape.parts) + [len(pts)]
    rings = []
    for a, b in zip(parts, parts[1:]):
        ring = pts[a:b]
        if len(ring) >= 3:
            rings.append(ring)
    return rings


def main(shp_path):
    import shapefile

    reader = shapefile.Reader(shp_path)
    records = reader.records()
    shapes = reader.shapes()

    ka = []
    for rec, shape in zip(records, shapes):
        if rec["ST_NM"] == "Karnataka":
            ka.append((rec["DISTRICT"], shape))
    print(f"Karnataka districts in shapefile: {len(ka)}")

    # bounding box
    lons, lats = [], []
    for _, shape in ka:
        for lon, lat in shape.points:
            lons.append(lon)
            lats.append(lat)
    lon0, lon1 = min(lons), max(lons)
    lat0, lat1 = min(lats), max(lats)

    kx = math.cos(math.radians((lat0 + lat1) / 2))
    span_x = (lon1 - lon0) * kx
    span_y = lat1 - lat0
    scale = min((VIEW_W - 2 * PADDING) / span_x, (VIEW_H - 2 * PADDING) / span_y)

    def project(lon, lat):
        return (round(PADDING + (lon - lon0) * kx * scale, 1),
                round(PADDING + (lat1 - lat) * scale, 1))

    districts = []
    missing = []
    for name, shape in ka:
        div_id = district_to_division(name)
        if not div_id:
            missing.append(name)
            continue

        paths = []
        best = None
        best_area = -1
        for ring in rings_from_shape(shape):
            pts = [project(lon, lat) for lon, lat in ring]
            simplified = rdp(pts, 0.4)
            if len(simplified) < 3:
                continue
            paths.append("M" + " ".join(f"{x} {y}" for x, y in simplified) + "Z")
            xs = [p[0] for p in simplified]
            ys = [p[1] for p in simplified]
            area = (max(xs) - min(xs)) * (max(ys) - min(ys))
            if area > best_area:
                best_area = area
                best = (sum(xs) / len(xs), sum(ys) / len(ys))

        districts.append({
            "name": name,
            "display": DISPLAY.get(name, name),
            "divisionId": div_id,
            "d": " ".join(paths),
            "labelX": round(best[0], 1) if best else None,
            "labelY": round(best[1], 1) if best else None,
        })

    if missing:
        print("WARNING unmapped districts:", missing, file=sys.stderr)

    divisions = []
    for div_id, div in DIVISIONS.items():
        members = [d for d in districts if d["divisionId"] == div_id]
        xs = [d["labelX"] for d in members if d["labelX"] is not None]
        ys = [d["labelY"] for d in members if d["labelY"] is not None]
        divisions.append({
            "id": div_id,
            "name": div["name"],
            "local": div["local"],
            "labelX": round(sum(xs) / len(xs), 1) if xs else 0,
            "labelY": round(sum(ys) / len(ys), 1) if ys else 0,
            "districts": [d["name"] for d in members],
        })

    out = {
        "viewBox": f"0 0 {VIEW_W} {VIEW_H}",
        "source": "datameet Census-2011 district boundaries (30 districts, WGS84)",
        "divisions": divisions,
        "districts": districts,
    }

    js = (
        "// GENERATED FILE - do not edit by hand.\n"
        "// Produced by scripts/build-karnataka-map.py from the Census-2011 shapefile.\n"
        f"// {len(districts)} districts across {len(divisions)} revenue divisions.\n"
        "export const KARNATAKA_MAP = "
        + json.dumps(out, separators=(",", ":"), ensure_ascii=False)
        + ";\n\nexport default KARNATAKA_MAP;\n"
    )

    target = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                          "frontend/src/data/karnatakaMap.js")
    os.makedirs(os.path.dirname(target), exist_ok=True)
    with open(target, "w", encoding="utf-8") as f:
        f.write(js)
    print(f"wrote {target}: {len(districts)} districts, {len(divisions)} divisions, {len(js)/1024:.1f} KB")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "/tmp/dist2011/2011_Dist.shp")
