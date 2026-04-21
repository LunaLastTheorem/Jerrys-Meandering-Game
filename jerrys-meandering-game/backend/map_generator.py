import json
import math
import random

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
    config = _get_config(total)
    who_wins = random.choice(["r", "b"])
    
    data = {
        "index" : -1,
        "rows" : rows,
        "cols" : cols,
        "districtSize": config[0][1],
        "whoWins": who_wins,
        "grid" : _build_puzzle(rows, cols, who_wins, config[1])
    }
    return data
    
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
        "index" : 9999,
        "rows" : rows,
        "cols" : cols,
        "districtSize": rows,
        "whoWins": None,
        "grid" : puzzle
    }
    
    return data
    