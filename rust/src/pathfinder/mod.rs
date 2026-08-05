mod models;

use once_cell::sync::Lazy;
use wasm_bindgen::prelude::wasm_bindgen;
use std::{collections::{BinaryHeap, HashMap, HashSet}, sync::Mutex, usize};

use models::*;
use crate::console_log;

static MAP: Lazy<Mutex<Option<Vec<u8>>>> = Lazy::new(|| Mutex::new(None));
static HEIGHT: Mutex<usize> = Mutex::new(0);
static WIDTH: Mutex<usize> = Mutex::new(0);

mod utils {
    use super::{Coord, HEIGHT, MAP, WIDTH};

    pub fn get(coord: Coord) -> Option<u8> {
        let x = coord.y;
        let y = coord.x;

        let height = *HEIGHT.lock().unwrap();
        let width = *WIDTH.lock().unwrap();
        if x >= height || y >= width {
            None
        } else {
            let vec = (MAP.lock().unwrap().clone()).unwrap();
            let index = x * width + y;
            if index < vec.len() {
                Some(vec[index])
            } else {
                None
            }
        }
    }

    pub fn is_valid_walkspace(tile: u8) -> bool {
        //tile & 1 != 0 &&
        tile & 2 != 0 &&
        tile & 4 == 0 &&
        //tile & 8 != 0 &&
        //tile & 16 != 0 &&
        //tile & 32 != 0 &&
        //tile & 64 != 0 &&
        //tile & 128 == 0 &&
        true
        
    }
}

#[wasm_bindgen]
pub fn set_map(map: Vec<u8>, height: usize, width: usize) -> bool {
    // visualise_map(&map, height, width);
    {
        let mut map_lock = MAP.lock().unwrap();
        *map_lock = Some(map);
    }

    {
        let mut height_lock = HEIGHT.lock().unwrap();
        *height_lock = height;
    }

    {
        let mut width_lock = WIDTH.lock().unwrap();
        *width_lock = width;
    }
    true
}

#[allow(dead_code)]
fn visualise_map(map: &Vec<u8>, height: usize, width: usize) -> Vec<&str> {
    let mapped: Vec<&str> = map
      .into_iter()
      .map(|&t| if utils::is_valid_walkspace(t) {" "} else {"#"})
      .collect();

    for i in 0..height {
        let row = &mapped[(i * width)..(i * width + width)];
        console_log!("{:?}{}",row.join(" "), i);
    }
    mapped
}

#[wasm_bindgen]
pub fn find_path(startx: usize, starty: usize, endx: usize, endy: usize, mode: u8) -> Vec<String> {
    let start = Coord { x: startx, y: starty };
    let end = Coord { x: endx, y: endy };
    let path = 
    a_star_find_path(start, end, if mode == 4 {&Mode::Four} else {&Mode::Eight});
    // console_log!("{:?}", path);
    if let Some(path) = path {
        path_to_instructions(path)
    } else {
        vec![]
    }
}


fn get_neighbors(coord: Coord, mode: &Mode) -> Vec<(Coord, u8)> {
    let height = *HEIGHT.lock().unwrap() as isize;
    let width = *WIDTH.lock().unwrap() as isize;

    let directions = 
    match *mode {
        Mode::Four => vec![
            (-1, 0, 10), // left
            (1, 0, 10),  // right
            (0, 1, 10),  // down
            (0, -1, 10), // up
        ],
        Mode::Eight => vec![
            (-1, 0, 10), // left
            (1, 0, 10),  // right
            (0, -1, 10), // up
            (0, 1, 10),  // down
            (-1, -1, 14), // top-left
            (1, -1, 14),  // top-right
            (1, 1, 14),   // bottom-right
            (-1, 1, 14),  // bottom-left
        ]
    };
        
    let mut neighbors = Vec::new();

    for (dx, dy, cost) in directions.iter() {
        let nx = coord.x as isize + dx;
        let ny = coord.y as isize + dy;

        if nx >= 0 && ny >= 0 && nx < height && ny < width {
            let neighbor = Coord { x: nx as usize, y: ny as usize };
            if let Some(tile) = utils::get(neighbor) {
                if utils::is_valid_walkspace(tile) {
                    neighbors.push((neighbor, *cost));
                }
            }
        }
    }

    neighbors
}

fn a_star_find_path(start: Coord, end: Coord, mode: &Mode) -> Option<Vec<Coord>> {
    let mut open_set = BinaryHeap::new();
    let mut closed_set = HashSet::new();
    let mut parent_map: HashMap<Coord, Coord> = HashMap::new();

    open_set.push(Tile::new_path(start, 0, end, mode));

    while let Some(current_tile) = open_set.pop() {
        if current_tile.coord == end {
            let mut path = vec![];
            let mut current = &end;

            path.insert(0, end);

            while let Some(next) = parent_map.get(current) {
                current = next;
                path.insert(0, *current);
            }
            // path.insert(0, start);

            return Some(path);
        }

        if closed_set.contains(&current_tile.coord) {
            continue;
        }
        closed_set.insert(current_tile.coord);

        // Explore neighbors and add to open_set
        for (neighbor,cost) in get_neighbors(current_tile.coord, mode) {
            if closed_set.contains(&neighbor) {
                continue;
            }

            if !parent_map.contains_key(&neighbor) {
                parent_map.insert(neighbor.clone(), current_tile.coord.clone());
            }

            open_set.push(Tile::new_path(neighbor, current_tile.cost + cost, end, mode));
        }
    }

    None // No path found
}


#[allow(dead_code)]
fn path_to_coords(path: Vec<Coord>) -> Vec<String> {
    path
      .iter()
      .map(|coord| format!("{},{}", coord.x,coord.y))
      .collect::<Vec<String>>()
}
    
fn path_to_instructions(path: Vec<Coord>) -> Vec<String> {
    #[derive(Hash, PartialEq, Eq)]
    struct Dir {
        x: isize,
        y: isize
    }
    
    // these are in image format, not array format
    let directions = HashMap::from(
        [
            (Dir { x: 0, y: -1 }, "up".to_string()),
            (Dir { x: 1, y: 0 }, "right".to_string()),
            (Dir { x: 0, y: 1 }, "down".to_string()),
            (Dir { x: -1, y: 0 }, "left".to_string()),
            (Dir { x: -1, y: -1 }, "topleft".to_string()),
            (Dir { x: 1, y: -1 }, "topright".to_string()),
            (Dir { x: -1, y: 1 }, "bottomleft".to_string()),
            (Dir { x: 1, y: 1 }, "bottomright".to_string()),
        ]
    );

    let mut instructions: Vec<String> = vec![];

    for (i, c) in path.iter().enumerate().take(path.len() - 1) {
        let n = &path[i + 1];
        let dir = Dir {
            x: n.x as isize - c.x as isize,
            y: n.y as isize - c.y as isize
        };

        if let Some(d) = directions.get(&dir) {
            instructions.push(d.clone());
        }
    }

    instructions
}












#[cfg(test)]
mod test {
    use crate::pathfinder::{path_to_instructions, utils::is_valid_walkspace, Mode};

    use super::{find_path, get_neighbors, set_map, Coord};

    #[test]
    fn validity() {
        assert_eq!(is_valid_walkspace(2), true);
        assert_eq!(is_valid_walkspace(4), false);
        assert_eq!(is_valid_walkspace(6), false);
        assert_eq!(is_valid_walkspace(10), true);
    }

    #[test]
    fn neighbor_center() {
        let map = vec![
            2, 2, 2,  2, 6, 2,
            2, 2, 2,  2, 2, 2,
            2, 2, 2,  2, 2, 2,

            2, 6, 2,  2, 6, 6,
            2, 2, 2,  2, 2, 2,
            2, 6, 2,  2, 6, 2,

            6, 6, 6,  6, 6, 6,
            2, 2, 2,  6, 2, 2,
            2, 6, 2,  2, 6, 2,

            6, 6, 6,  6, 6, 6,
            6, 2, 2,  6, 2, 2,
            6, 6, 2,  6, 6, 6,
        ];
        let expected_counts = [8, 7, 6, 5, 4, 3, 2, 1];

        set_map(map, 12, 6);

        for (i, &e) in expected_counts.iter().enumerate() {
            let x = ((i * 3 + 1) / 2) - if i % 2 == 0 {0} else {2} + 1;
            let y = (i * 3 + 1) % 6;
            //println!("{},{}", x, y);

            let neighbors = get_neighbors(Coord {x, y}, &Mode::Eight);
            println!("{:#?}", neighbors);
            assert_eq!(neighbors.len(), e)
        }
    }

    #[test]
    fn test_path_to_instructions() {
        let path = vec![
            Coord { x: 0, y: 0 },
            Coord { x: 1, y: 0 },
            Coord { x: 1, y: 1 },
            Coord { x: 2, y: 1 },
            Coord { x: 1, y: 1 },
            Coord { x: 2, y: 2 },
            Coord { x: 1, y: 3 },
        ];

        let instructions = path_to_instructions(path);
        assert_eq!(instructions, vec!["right", "down", "right", "left", "bottomright", "bottomleft"]);
    }

    #[test]
    fn path_to_adjecent() {
        let map = vec![
            2, 2, 2, 2,
            2, 2, 2, 2,
            2, 2, 2, 2,
        ];
        set_map(map,4, 4);
        let moves = find_path(1, 1, 1, 2, 8);
        println!("{:?}", moves);
        assert!(moves.len() == 2)
    }

    #[test]
    fn path_to_adjecent_on_edge() {
        let map = vec![
            2, 2, 2, 2,
            2, 2, 2, 2,
            2, 2, 2, 2,
        ];
        set_map(map, 4, 4);
        let moves = find_path(0, 1, 0, 2, 8);
        println!("{:?}", moves);
        assert!(moves.len() == 2)
    }

    #[test]
    fn path_to_orthogonal() {
        let map = vec![
            2, 2, 2, 2, 2, 2,
            2, 2, 2, 2, 2, 2,
            2, 2, 2, 2, 2, 2
        ];
        set_map(map, 3, 6);
        let moves = find_path(1, 1, 1, 4, 8);
        println!("{:?}", moves);
        assert!(moves.len() == 4)
    }

    #[test]
    fn path_to_orthogonal_on_edge() {
        let map = vec![
            2, 2, 2, 2, 2, 2,
            2, 2, 2, 2, 2, 2,
            2, 2, 2, 2, 2, 2
        ];
        set_map(map, 3, 6);
        let moves = find_path(2, 1, 2, 4,8);
        println!("{:?}", moves);
        assert!(moves.len() != 0)
    }
    
    #[test]
    fn path_around_point() {
        let map = vec![
            2, 2, 2, 2, 2, 2, 2,
            2, 2, 2, 2, 2, 2, 2,
            2, 2, 2, 2, 2, 2, 2,
            2, 2, 2, 2, 2, 2, 2,
            2, 2, 2, 2, 2, 2, 2
        ];
        set_map(map, 5, 7);
        let moves = find_path(2, 1, 2, 4, 8);
        println!("{:?}", moves);
        assert!(moves.len() != 0)
    }
    #[test]
    fn path_in_box() {
        let map = vec![
            6, 6, 6, 6, 6, 6, 6,
            6, 2, 2, 2, 2, 2, 6,
            6, 2, 2, 2, 2, 2, 6,
            6, 2, 2, 2, 2, 2, 6,
            6, 6, 6, 6, 6, 6, 6
        ];
        set_map(map, 5, 7);
        let moves = find_path(2, 1, 2, 4, 8);
        println!("{:?}", moves);
        assert!(moves.len() != 0)
    }

    #[test]
    fn path_behind_wall() {
        let map = vec![
            2, 2, 2, 2, 2, 2, 2,
            2, 2, 2, 6, 2, 2, 2,
            2, 2, 2, 6, 2, 2, 2,
            2, 2, 2, 6, 2, 2, 2,
            2, 2, 2, 6, 2, 2, 2
        ];
        set_map(map, 5, 7);
        let moves = find_path(3, 1, 3, 5, 8);
        println!("{:?}", moves);
        assert!(moves.len() != 0)
    }

    #[test]
    fn path_behind_corner() {
        let map = vec![
            2, 2, 2, 2, 2, 2, 2,
            2, 2, 2, 6, 6, 6, 2,
            2, 2, 2, 6, 2, 2, 2,
            2, 2, 2, 6, 2, 2, 2,
            2, 2, 2, 6, 2, 2, 2
        ];
        set_map(map, 5, 7);
        let moves = find_path(3, 1, 3, 5, 8);
        println!("{:?}", moves);
        assert!(moves.len() != 0)
    }

    #[test]
    fn path_behind_pocket() {
        let map = vec![
            2, 2, 2, 2, 2, 2, 2,
            2, 2, 2, 6, 6, 6, 2,
            2, 2, 2, 6, 2, 6, 2,
            2, 2, 2, 6, 2, 6, 2,
            2, 2, 2, 6, 2, 2, 2
        ];
        set_map(map, 5, 7);
        let moves = find_path(3, 1, 2, 4, 8);
        println!("{:?}", moves);
        assert!(moves.len() != 0)
    }
}