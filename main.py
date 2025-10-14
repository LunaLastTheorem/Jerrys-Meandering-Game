import pygame
import asyncio

BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
GREEN = (0, 255, 0)
RED = (255, 0, 0)

# Initialize Pygame
pygame.init()

# Set up the game window
size = (255, 255)
screen = pygame.display.set_mode(size)

# Grid settings
width = 20
height = 20
margin = 5 # this is margin between each box and edges of screen

# Make a 10x10 array to represent our grid, filled with 0
grid = []
for row in range(10):
    grid.append([])
    for column in range(10):
        grid[row].append(0)

pygame.display.set_caption("Super Cool and Awesome Game")
clock = pygame.time.Clock() # apparently controls how fast the screen updates

async def main():
    # Main Loop
    done = False
    while not done:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                done = True
            elif event.type == pygame.MOUSEBUTTONDOWN:
                pos = pygame.mouse.get_pos()
                column = pos[0] // (width + margin)
                row = pos[1] // (height + margin)
                grid[row][column] = 1
                print(f"Row: {row} Column: {column}")
        
        # --- Game logic here

        # --- Screen-clearing code goes here

        # We clear the screen to white. DO NOT put other drawing commands
        # above this, or they WILL be erased with this command.
        # If you want a background image, replace this clear with blit'ing
        # background image.
        screen.fill(BLACK)

        # --- Drawing code should go here
        for row in range(10):
            for column in range(10):
                color = WHITE
                if grid[row][column] == 1:
                    color = GREEN
                pygame.draw.rect(screen, color, [(margin + width) * column + margin, (margin + height) * row + margin, width, height])

        # --- Go ahead and update the screen with what we've drawn
        pygame.display.flip()

        # --- Limit 60 frames per second
        clock.tick(60)
        await asyncio.sleep(0)

asyncio.run(main())
# Quit Pygame
pygame.quit()