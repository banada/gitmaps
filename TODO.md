- [x] Graph editor

    - [x] From within React, use Cytoscape

    - [x] Needs to support multiple layers

    - [x] Needs to render text

    - [x] Create new node on right click

    - [x] Arrows instead of lines

    - [x] Double-click node to open sidebar

    - [x] Sidebar text editor

    - [x] Shift-click and drag to select group, then display a button to group items

    - [x] Delete nodes

    - [x] Delete edges

    - [x] Make it pretty

    - [x] When deleting groups, leave children alone.
    
    - [ ] When moving child outside of group, delete wrapper if no data exist.

    - [ ] Saving to a branch needs to redirect to that branch if it's not the current

- [x] Github Integration

    - [x] Users that are part of the project can make changes

    - [x] Users can fork

    - [x] Visualize diffs

- [ ] Exporting

    - [x] JSON

    - [ ] DOT (optional)

- [x] Pull Request Page

    - [x] Get pull request data

    - [x] Check if PR involves two gitmap.json files

    - [x] Display branch name

- [x] Add instructions / tips (Tippy library?)

## Bugs

- [ ] Client

    - [ ] Cannot export JSON if graph has 0 edges

- [ ] Server

    - [ ] Subsequent API calls can result in 409 HTTP Errors (see commitAndPush) 
