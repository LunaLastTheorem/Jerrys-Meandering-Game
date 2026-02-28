import math

def calculate_efficiency_gap(districts, total_votes_party_a, total_votes_party_b):
    """
    Calculate the efficiency gap for the redistricting plan.
    
    Efficiency Gap measures partisan bias by comparing wasted votes between parties.
    Values range from -1 to 1, where:
    - Positive numbers favor party A
    - Negative numbers favor party B
    - Values closer to 0 are more fair
    
    Args:
        districts: List of district dicts with 'votes_party_a' and 'votes_party_b'
        total_votes_party_a: Total votes cast for party A
        total_votes_party_b: Total votes cast for party B
    
    Returns:
        Float representing the efficiency gap
    """
    if not districts or (total_votes_party_a + total_votes_party_b) == 0:
        return 0.0
    
    total_votes = total_votes_party_a + total_votes_party_b
    wasted_votes_a = 0
    wasted_votes_b = 0
    
    for district in districts:
        votes_a = district.get('votes_party_a', 0)
        votes_b = district.get('votes_party_b', 0)
        district_total = votes_a + votes_b
        
        if district_total == 0:
            continue
        
        votes_to_win = (district_total // 2) + 1
        
        if votes_a > votes_b:
            wasted_votes_a += votes_a - votes_to_win # Party A wins: wasted votes for A are those above what's needed to win
            wasted_votes_b += votes_b # Wasted votes for B are all their votes (lost in this district)
        else:
            wasted_votes_b += votes_b - votes_to_win # Party B wins: wasted votes for B are those above what's needed to win
            wasted_votes_a += votes_a # Wasted votes for A are all their votes (lost in this district)
    
    efficiency_gap = (wasted_votes_b - wasted_votes_a) / total_votes
    
    return round(efficiency_gap, 3)


def calculate_polsby_popper_ratio(districts):
    """
    Calculate the average Polsby-Popper compactness ratio for all districts.
    
    - 1.0 = perfect circle (most compact)
    - Smaller values = more gerrymandered/less compact
    
    Args:
        districts: List of district dicts with 'cells' (list of [row, col] coordinates)
    
    Returns:
        Dict with 'average_ratio' and 'individual_ratios'
    """
    if not districts:
        return {"average_ratio": 0.0, "individual_ratios": []}
    
    individual_ratios = []
    
    for district in districts:
        cells = district.get('cells', [])
        
        if not cells:
            individual_ratios.append(0.0)
            continue
        
        area = len(cells)
        perimeter = calculate_perimeter(cells)
        
        # Calculate Polsby-Popper ratio
        if perimeter > 0:
            ratio = (4 * math.pi * area) / (perimeter ** 2)
            ratio = round(ratio, 3)
        else:
            ratio = 0.0
        
        individual_ratios.append(ratio)
    
    average_ratio = round(sum(individual_ratios) / len(individual_ratios), 3) if individual_ratios else 0.0
    
    return {
        "average_ratio": average_ratio,
        "individual_ratios": individual_ratios
    }


def calculate_perimeter(cells):
    """
    Calculate the perimeter of a district given its cells on a grid.
    
    Counts the number of edges that border cells outside the district.
    
    Args:
        cells: List of [row, col] coordinates
    
    Returns:
        Integer representing the perimeter
    """
    if not cells:
        return 0
    
    cell_set = set(tuple(cell) for cell in cells)
    perimeter = 0
    
    for row, col in cells:
        neighbors = [
            (row - 1, col),
            (row + 1, col),
            (row, col - 1),
            (row, col + 1),
        ]
        
        for neighbor in neighbors:
            if neighbor not in cell_set:
                perimeter += 1
    
    return perimeter


def compute_metrics(districts, total_votes_party_a, total_votes_party_b):
    """
    Compute all metrics for the given redistricting plan.
    
    Args:
        districts: List of district dicts with 'votes_party_a', 'votes_party_b', and 'cells'
        total_votes_party_a: Total votes cast for party A
        total_votes_party_b: Total votes cast for party B
    
    Returns:
        Dict with efficiency_gap and polsby_popper metrics
    """
    efficiency_gap = calculate_efficiency_gap(districts, total_votes_party_a, total_votes_party_b)
    polsby_popper = calculate_polsby_popper_ratio(districts)
    
    return {
        "efficiency_gap": efficiency_gap,
        "polsby_popper": polsby_popper,
        "timestamp": None  # Will be set by the API
    }