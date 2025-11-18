import json 
from pathlib import Path

maps = []

json_file = Path("./maps.json")
if json_file.exists():
    print("maps file found, appending to current")
    with open(json_file, "r") as file:
        maps = json.load(file)

continue_flag = "c"

while len(continue_flag) == 0 or continue_flag[0] != 'q' :
    try:
        rows = int(input("rows? "))
        cols = int(input("cols? "))
        district_size = int(input("size of district? "))
        colors_string = str(input("list colors from top left to bottom right: "))
        if len(colors_string) != rows * cols:
            print("number of colors is not the same as the size of the grid")
            break
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
        "rows" : rows,
        "cols" : cols,
        "district_size" : district_size,
        "grid": curr_grid
    }
    maps.append(data)
    continue_flag = input("continue? (q to quit)")
        
with open(json_file, "w") as f:
    json.dump(maps, f)