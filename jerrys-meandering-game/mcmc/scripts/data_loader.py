import geopandas as gpd
from gerrychain import Graph

def load_graph(filepath):
    gdf = gpd.read_file(filepath)
    gdf["area_m"] = gdf.geometry.area

    cols_to_add = [
        "CD", # Congressional District
        "vistapre20", # Precinct ID
        "area_m", # Area of the precinct in square meters
        "TOTPOP", # Total population in 2020 Census
        "PRE20D", # Number of votes for 2020 Democratic Presidential candidate
        "PRE20R", # Number of votes for 2020 Republican Presidential candidate
        "PRE20O" # Number of votes for 2020 other party's Presidential candidate
    ]

    graph = Graph.from_geodataframe(gdf, cols_to_add=cols_to_add)
    return graph