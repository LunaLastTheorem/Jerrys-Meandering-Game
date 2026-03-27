import json
import math
import random

def _better_split(w : int, h : int):
    w = math.ceil( w / 2 ) if (w / 2) % 1 != 0 else (w / 2) + 1
    h = math.ceil( h / 2 ) if (h / 2) % 1 != 0 else (h / 2) + 1
    return w * h

def _get_factors(n):
    return [i for i in range(2, n + 1) if n % i == 0]

def _get_config(cells : int):
    minimum_votes = float("inf")
    reg_to_disc = (1,1)
    for factor in _get_factors(cells):
        w = factor
        h = int(cells / factor)
        nm = (w, h)
        curr = int(_better_split(w, h))
        if curr < minimum_votes:
            minimum_votes = curr
            reg_to_disc = nm
        print(nm, curr)
    return (reg_to_disc, minimum_votes)
    
def generate_puzzle(w, h):
    total = w * h
    config = _get_config(total)
    who_wins = random.choice(["r", "b"])
    
    data = {
        "index" : 9999,
        "rows" : h,
        "cols" : w,
        "districtSize": config[0][1],
        "whoWins": who_wins,
        "grid" : _build_puzzle(w, h, who_wins, config[1])
    }
    return data
    
def _build_puzzle(width : int, height : int, who_wins : chr, minium_votes : int):
    rival_party = 'r' if who_wins == 'b' else 'b'
    puzzle = []
    samples = []
    for row in range(height):
        curr_row = []
        for col in range(width):
            samples.append((row, col))
            curr_row.append(rival_party)
        puzzle.append(curr_row)
    
    for row, col in random.sample(samples, minium_votes):
        puzzle[row][col] = who_wins
         
    return puzzle
        
