import json 
from pathlib import Path

maps = []
puzzle_index = 0

json_file = Path("./src/maps/maps.json")
if json_file.exists():
    print("maps file found, appending to current")
    with open(json_file, "r") as file:
        maps = json.load(file)
        puzzle_index = maps[-1]["index"] + 1
else:
    print("making new json file")

continue_flag = "c"

while len(continue_flag) == 0 or continue_flag[0] != 'q' :
    print(f"puzzle number {puzzle_index}")
    try:
        rows = int(input("rows? "))
        cols = int(input("cols? "))
        district_size = int(input("size of district? "))
        colors_string = str(input("list colors from top left to bottom right: "))
        if len(colors_string) != rows * cols:
            print("number of colors is not the same as the size of the grid")
            break
        who_wins = str(input("Who wins? (r or b)"))
    except ValueError as e:
        print(f"Error found, saving progress... \n{e}")
        break
    
    index = 0
    curr_grid = []
    for i in range(rows):
        curr_row = []
        for j in range(cols):
            curr_row.append(colors_string[index])
            index += 1
        curr_grid.append(curr_row)
    print(curr_grid)
    
    data = {
        "index" : puzzle_index,
        "rows" : rows,
        "cols" : cols,
        "districtSize" : district_size,
        "grid": curr_grid,
        "whoWins" : who_wins
    }

    maps.append(data)
    continue_flag = input("continue? (q to quit)")
    puzzle_index += 1
        
with open(json_file, "w") as f:
    json.dump(maps, f)