from gerrychain import (Graph, GeographicPartition, updaters, accept)
from gerrychain.proposals import recom
from gerrychain.constraints import contiguous
from functools import partial
import geopandas as gpd

from recom import Recom
from pathlib import Path

root_directory = Path(__file__).resolve().parent.parent # mcmc
data_directory = root_directory / 'simulation_data' / 'ut'

# Load the shapefile and create a graph. 
filename = data_directory / 'ut.shp'

gdf = gpd.read_file(filename)
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

# Define updaters for the partition. We will track population, cut edges, perimeters, and area.
my_updaters = {
    "population": updaters.Tally("TOTPOP", alias="population"),
    "cut_edges": updaters.cut_edges,
    "perimeters": updaters.perimeter,
    "area": updaters.Tally("area_m", alias="area")
}

# Create the initial partition. We are using the 2021 State House of Representatives Districts Plan as the initial partition. 
initial_partition = GeographicPartition(
    graph,
    assignment="CD",
    updaters=my_updaters
)

# Calculate the ideal population for the districts. This is the total population divided by the number of districts.
ideal_population = sum(initial_partition["population"].values()) / len(initial_partition)

# Define the proposal function. We are using the Recom proposal, which merges two adjacent districts and then resplits them using a spanning tree. We set the population target to be the ideal population, and we allow for a small deviation of 1%. We also set node_repeats to 2, which means that when we merge two districts, we will repeat the process of merging and splitting twice before accepting the proposal. This can help to explore the space of partitions more effectively.
proposal = partial(
    recom,
    pop_col="TOTPOP",
    pop_target=ideal_population,
    epsilon=0.01,
    node_repeats=2,
)

# Create the Markov Chain. We use the proposal function defined above, and we set the constraint to be that the districts must be contiguous. We also set the acceptance function to always accept the proposal, which means that we will explore the space of partitions without any restrictions. We start from the initial partition defined above, and we run the chian for 100 steps.
recom_chain = Recom(
    graph=graph,
    initial_partition=initial_partition,
    proposal=proposal,
    constraints=[contiguous],
    accept=accept.always_accept,
    total_steps=100
)
recom_chain.display_initial_partition()

chain_data, frames = recom_chain.collect_chain_data(recom_chain.run_chain())

gif_partitions_directory = root_directory / 'gif_partitions'
recom_chain.save_gif(frames, gif_partitions_directory / "utah_100.gif")