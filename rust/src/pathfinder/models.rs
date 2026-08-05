#[derive(PartialEq, Eq, PartialOrd, Ord, Clone, Copy, Hash, Debug)]
pub struct Coord {
    pub x: usize,
    pub y: usize
}
impl Coord {
    #[allow(unused)]
    fn distance_eu(&self, other: &Self) -> f64 {
        let dx = self.x as isize - other.x as isize;
        let dy = self.y as isize - other.y as isize;
        ((dx.pow(2) + dy.pow(2)) as f64).sqrt()
    }
    #[allow(unused)]
    fn distance_man(&self, other: &Self) -> f64 {
        ((self.x.abs_diff(other.x)) + (self.y.abs_diff(other.y))) as f64
    }
    #[allow(dead_code)]
    fn distance_diag(&self, other: &Self) -> f64 {
        let dx = (self.x as i64 - other.x as i64).abs();
        let dy = (self.y as i64 - other.y as i64).abs();
        std::cmp::max(dx, dy) as f64 + std::cmp::min(dx, dy) as f64 * ((2.0f64).sqrt() - 1.0f64)
    }
}

#[derive(PartialOrd, PartialEq)]
pub struct Tile {
    pub coord: Coord,
    pub cost: u8,
    pub heur: f64,
}
impl Eq for Tile {}
impl Ord for Tile {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        let f1 = self.cost as f64 + self.heur;
        let f2 = other.cost as f64 + other.heur;
        if f1 > f2 {
            std::cmp::Ordering::Less
        } else if f2 > f1 {
            std::cmp::Ordering::Greater
        } else {
            std::cmp::Ordering::Equal
        }
    }
}
impl Tile {
    /* pub fn new(coord: Coord) -> Self {
        Tile {
            coord,
            cost: 0,
            heur: 0.0
        }
    } */

    pub fn new_path(coord: Coord, cost: u8, end: Coord, mode: &Mode) -> Self {
        let heur = if let Mode::Four = mode {
            Coord::distance_man(&coord, &end) as f64
        } else {
            Coord::distance_eu(&coord, &end) as f64 * 1.0
        };
        Tile {
            coord: coord.clone(),
            cost,
            heur
        }
    }
}

pub enum Mode {
    Four, Eight
}