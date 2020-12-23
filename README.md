# Setup Instrunctions
- A web server will be needed
- Download AnimForce into the web server's root
- Build the sprite sheets
  - Download https://github.com/cmann1/PropUtils/
  - Run the **_extract_sprites_reference.py** PropUtils script.
  - A **reference_sprites* directory and **sprites-reference-data** file should be created.
  - Open **AnimForce/scripts/sprite_sheet_generator.py**
  - Modify the **HOME = ** line to point to the location of **PropUtils** and then run the script
  - This will create all the required sprite data in **assets/sprites**
 - Start the web server and browse to the AnimForce download location in your browser

# Usage
- Keys:
  - **Shift + N** - New project
  - **Ctrl + S** - Save
  - **Ctrl + O** - Project manager
  - **Right mouse** - Pan
  - **Scroll** - Zoom
- Add elements on the bottom left.
- With a sprite selected press **Enter** to change the sprite.
- Once the model is created, press the plus button in the bottom right to add one or more animations.
- Use the timeline and timeline controls to create the animation.
- Export to Angelscript using the buttons on the right.
