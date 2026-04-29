import json
import math
import random
import pickle
import os

def _better_split(cols : int, rows : int):
    return (cols // 2 + 1) * (rows // 2 + 1)

def _get_factors(n):
    factors = []
    for i in range(2, math.isqrt(n) + 1):
        if n % i == 0:
            factors.append(i)
            if i != n // i:
                factors.append(n // i)
    return factors

def _get_config(cells : int):
    minimum_votes = float("inf")
    reg_to_disc = (1,1)
    for factor in _get_factors(cells):
        cols, rows = factor, cells // factor
        curr = int(_better_split(cols, rows))
        if curr < minimum_votes:
            minimum_votes = curr
            reg_to_disc = (cols, rows)
    return (reg_to_disc, minimum_votes)
    
def generate_puzzle(rows, cols):
    total = cols * rows
    who_wins = random.choice(["r", "b"])
    district_size = 0
    grid = []
    
    if total > 42:
        config = _get_config(total)
        district_size = config[0][1]
        grid = _build_puzzle(rows, cols, who_wins, config[1] + 2)
    else:
        district_size = rows
        grid = build_from_precomputed(rows, cols, who_wins)
    
    data = {
        "index" : -1,
        "rows" : rows,
        "cols" : cols,
        "districtSize": district_size,
        "whoWins": who_wins,
        "grid" : grid
    }
    return data

def build_from_precomputed(rows : int, cols : int, who_wins : chr):
    rival_party = 'r' if who_wins == 'b' else 'b'
    puzzle = []
    with open(f"./backend/partitions/partitions{rows}_{cols}.data", "rb") as file:
        partitions = pickle.load(file)
        
    random_partition = list(random.choice(list(partitions)))
    print(random_partition)
    random.shuffle(random_partition)
    
    winning_regions = cols // 2 + 1
    winning_votes = rows // 2 + 1
    
    lookup_table = {}
    
    #cracking regions
    for i, region in enumerate(random_partition):
        region = list(region)
        random.shuffle(region)
        
        if i < winning_regions: #crackable regions
            for j, cell in enumerate(region):
                lookup_table[cell] = who_wins if j < winning_votes else rival_party
        else:
            for cell in region: #packing regions
                lookup_table[cell] = rival_party
    
    for row in range(rows):
        curr_row = []
        for col in range(cols):
            curr_row.append(lookup_table[(row, col)])
        puzzle.append(curr_row)
            
    return puzzle

def _build_puzzle(rows : int, cols : int, who_wins : chr, minium_votes : int):
    rival_party = 'r' if who_wins == 'b' else 'b'
    puzzle = []
    samples = []
    for row in range(rows):
        curr_row = []
        for col in range(cols):
            samples.append((row, col))
            curr_row.append(rival_party)
        puzzle.append(curr_row)
    
    for row, col in random.sample(samples, minium_votes):
        puzzle[row][col] = who_wins
         
    return puzzle
        
def generate_multiplayer_puzzle(rows: int, cols : int):
    puzzle = [[random.choice(['r', 'b']) for col in range(cols)] for row in range(rows)]
    
    data = {
        "index" : -1,
        "rows" : rows,
        "cols" : cols,
        "districtSize": rows,
        "whoWins": None,
        "grid" : puzzle
    }
    
    return data
    