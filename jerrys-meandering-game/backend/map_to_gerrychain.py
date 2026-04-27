import random
import networkx as nx
from gerrychain import Partition, updaters

def grid_to_graph(grid_map, districts):
    """
    Convert a 2D grid and district assignments to a networkx Graph.

    Args:
        grid_map: 2D list of cell colors (e.g., [["b", "r"], ["b", "b"]])
        districts: List of districts, each containing cells [[row, col], ...]

    Returns:
        networx.Graph with nodes for each cell and edges between adjacent cells.
        Each node has attributes: row, col, district, TOTPOP, PRE200D, PRE20O
    """

    graph = nx.Graph()

    # Build node to district mapping
    node_to_district = {}
    for district_id, district_cells in enumerate(districts):
        for cell in district_cells:
            row, col = cell
            node_id = f"{row}_{col}"
            node_to_district[node_id] = district_id
    
    # Add nodes with voting data and grid attributes
    for row in range(len(grid_map)):
        for col in range(len(grid_map[0])):
            node_id = f"{row}_{col}"
            cell_color = grid_map[row][col]

            # Generate voting data for this cell
            votes = generate_voting_data(node_id, cell_color)

            # Determine district (if not in districts list, assign to -1 for invalid)
            district = node_to_district.get(node_id, -1)

            graph.add_node(
                node_id,
                row=row,
                col=col,
                district=district,
                TOTPOP=votes["TOTPOP"],
                PRE200D=votes["dem_votes"],
                PRE20R=votes["rep_votes"],
                PRE20O=votes["other_votes"],
                cell_color=cell_color
            )
    
    # Add edges between adjacent cells
    rows = len(grid_map)
    cols = len(grid_map[0])

    for row in range(rows):
        for col in range(cols):
            node_id = f"{row}_{col}"

            # Check adjacent cells
            for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                neighbor_row = row + dr
                neighbor_col = col + dc

                if 0 <= neighbor_row < rows and 0 <= neighbor_col < cols:
                    neighbor_id = f"{neighbor_row}_{neighbor_col}"
                    graph.add_edge(node_id, neighbor_id)
    
    return graph


def generate_voting_data(node_id, cell_color):
    """
    Generate synthetic voting data for a grid cell based on party color.

    Args:
        node_id: Node identifier
        cell_color: "b" for blue (Democrat), "r" for red (Republican)

    Returns:
        Dictionary with TOTPOP, dem_votes, rep_votes, other_votes
    """
    TOTPOP = 1000 # About 1000 per precinct

    if cell_color == "b":
        # Blue cell: strong democratic lean
        dem_votes = 900
        rep_votes = 100
    else:
        # Red cell: strong republican lean
        dem_votes = 100
        rep_votes = 900
    
    other_votes = TOTPOP - (dem_votes + rep_votes)

    return {
        "TOTPOP": TOTPOP,
        "dem_votes": dem_votes,
        "rep_votes": rep_votes,
        "other_votes": max(0, other_votes)
    }

def create_initial_partition(graph):
    """
    Create a GerryChain Partition object with all necessary updaters.

    Args:
        graph: networkx.Graph created by grid_to_graph()

    Returns:
        gerrychain.Partition object ready for MCMC simulation

    Raises:
        ValueError if graph has invalid district assignments 
    """

    # Check that all nodes have valid districts
    invalid_nodes = [n for n in graph.nodes() if graph.nodes[n]['district'] == -1]
    if invalid_nodes:
        raise ValueError(f"Graph has {len(invalid_nodes)} unassigned nodes: {invalid_nodes}")
    
    # Define updaters for vote share and population tracking
    my_updaters = {
        "population": updaters.Tally("TOTPOP", alias="population"),
        "cut_edges": updaters.cut_edges,
        "dem_votes": updaters.Tally("PRE200D", alias="dem_votes"),
        "rep_votes": updaters.Tally("PRE20R", alias="rep_votes"),
        "other_votes": updaters.Tally("PRE20O", alias="other_votes")
    }

    # Create initial partition using district node attribute as initial assignment
    partition = Partition(
        graph,
        assignment="district",
        updaters=my_updaters
    )

    return partition

def is_contiguous(partition):
    """
    Check if all districts in partition are contiguous

    Args:
        partition: gerrychain.Partition object

    Returns:
        bool: True if all districts are contiguous, False otherwise
    """

    for district, nodes in partition.parts.items():
        subgraph = partition.graph.subgraph(nodes)
        if not nx.is_connected(subgraph):
            return False
    return True

def validate_submitted_districts(grid_map, districts):
    """
    Validate that submitted districts are contiguous before MCMC

    Args: 
        grid_map: 2D list of cell colors
        districts: List of districts, each containing cells [[row, col], ...]
    
    Returns:
        (valid: bool, error_message: str or None)
    """

    try:
        # Build graph and partition
        graph = grid_to_graph(grid_map, districts)
        partition = create_initial_partition(graph)

        # Check contiguity
        if not is_contiguous(partition):
            return False, "Submitted districts are not contiguous. Please ensure each district is connected."
        
        return True, None
    except ValueError as e:
        return False, str(e)
    except Exception as e:
        return False, f"Error validating districts: {str(e)}"