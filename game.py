import pygame

# Define some colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
GREEN = (0, 255, 0)
RED = (255, 0, 0)

# Initialize Pygame
pygame.init()

# Set up the game window
size = (700, 500)
screen = pygame.display.set_mode(size)

pygame.display.set_caption("Super Cool and Awesome Game")

done = False

clock = pygame.time.Clock() # apparently controls how fast the screen updates

# Main Loop
while not done:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            done = True
    
    # --- Game logic here

    # --- Screen-clearing code goes here

    # We clear the screen to white. DO NOT put other drawing commands
    # above this, or they WILL be erased with this command.
    # If you want a background 

# Quit Pygame
pygame.quit()