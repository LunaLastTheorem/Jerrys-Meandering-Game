export class AIAgent {
    constructor(color, regionSize) {
        this.color = color;
        this.regionSize = regionSize;
    }

    myTurn(grid, lockedSet) {
        const free = this.getFreeCells(grid, lockedSet);
        const majority = Math.ceil(this.regionSize / 2);
        const starts = this.shuffle(free);

        const bestPack = this.pack(grid, lockedSet, starts);
        const bestCrack = this.crack(grid, lockedSet, starts);

        if (bestPack && bestPack.score >= majority) return bestPack.region;
        if (bestCrack && bestCrack.score >= majority) return bestCrack.region;
        return this.randomRegion(grid, lockedSet, free);
    }

    pack(grid, lockedSet, starts) {
        let best = null, bestScore = -1;

        for (const start of starts) {
            const region = this.buildPackRegion(grid, lockedSet, start);
            if (!region || this.hasIslands(grid, lockedSet, region)) continue;

            const score = region.filter(c => this.isOpponent(grid[c.row][c.col])).length;
            if (score > bestScore) { bestScore = score; best = region; }
        }

        return best ? { region: best, score: bestScore } : null;
    }

    crack(grid, lockedSet, starts) {
        let best = null, bestScore = -1;

        for (const start of starts) {
            const region = this.buildCrackRegion(grid, lockedSet, start);
            if (!region || this.hasIslands(grid, lockedSet, region)) continue;

            const score = region.filter(c => this.isMine(grid[c.row][c.col])).length;
            if (score > bestScore) { bestScore = score; best = region; }
        }

        return best ? { region: best, score: bestScore } : null;
    }

    buildPackRegion(grid, lockedSet, start) {
        return this.growRegion(grid, lockedSet, start, "pack");
    }

    buildCrackRegion(grid, lockedSet, start) {
        return this.growRegion(grid, lockedSet, start, "crack");
    }

    randomRegion(grid, lockedSet, free) {
        for (const start of this.shuffle(free)) {
            const region = this.growRegion(grid, lockedSet, start, "random");
            if (region && !this.hasIslands(grid, lockedSet, region)) return region;
        }
        return null;
    }

    growRegion(grid, lockedSet, start, mode) {
        const region = [start];
        const inRegion = new Set([`${start.row},${start.col}`]);

        while (region.length < this.regionSize) {
            const neighbors = this.getNeighbors(region, grid, lockedSet, inRegion);
            if (!neighbors.length) return null;

            const chosen = this.pickNeighbor(neighbors, grid, mode);
            region.push(chosen);
            inRegion.add(`${chosen.row},${chosen.col}`);
        }

        return region;
    }

    getNeighbors(region, grid, lockedSet, inRegion) {
        const rows = grid.length, cols = grid[0].length;
        const neighbors = [];

        for (const { row, col } of region) {
            for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
                const nr = row + dr, nc = col + dc;
                const key = `${nr},${nc}`;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols
                    && !lockedSet.has(key) && !inRegion.has(key)) {
                    neighbors.push({ row: nr, col: nc });
                }
            }
        }

        return neighbors;
    }

    pickNeighbor(neighbors, grid, mode) {
        let best = null;
        let bestScore = -Infinity;

        for (const n of neighbors) {
            const cell = grid[n.row][n.col];

            let score = 0;

            if (mode === "pack") {
                if (this.isOpponent(cell)) score = 1;
            } else if (mode === "crack") {
                if (this.isMine(cell)) score = 1;
            }

            score += Math.random() * 0.4;

            if (score > bestScore) {
                bestScore = score;
                best = n;
            }
        }

        return best;
    }


    hasIslands(grid, lockedSet, proposed) {
        const proposedSet = new Set(proposed.map(c => `${c.row},${c.col}`));
        const free = [];

        for (let r = 0; r < grid.length; r++)
            for (let c = 0; c < grid[0].length; c++) {
                const key = `${r},${c}`;
                if (!lockedSet.has(key) && !proposedSet.has(key)) free.push({ row: r, col: c });
            }

        const freeSet = new Set(free.map(c => `${c.row},${c.col}`));
        const visited = new Set();

        for (const cell of free) {
            const key = `${cell.row},${cell.col}`;
            if (visited.has(key)) continue;

            let size = 0;
            const queue = [cell];
            visited.add(key);

            while (queue.length) {
                const { row, col } = queue.shift();
                size++;
                for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
                    const k = `${row + dr},${col + dc}`;
                    if (freeSet.has(k) && !visited.has(k)) { 
                        visited.add(k); queue.push({ row: row + dr, col: col + dc }); 
                    }
                }
            }

            if (size % this.regionSize !== 0) return true;
        }

        return false;
    }

    isMine(cell) { return this.color === "blue" ? cell.isBlue : !cell.isBlue; }
    isOpponent(cell) { return this.color === "blue" ? !cell.isBlue : cell.isBlue; }

    getFreeCells(grid, lockedSet) {
        const free = [];
        for (let r = 0; r < grid.length; r++)
            for (let c = 0; c < grid[0].length; c++)
                if (!lockedSet.has(`${r},${c}`)) free.push({ row: r, col: c });
        return free;
    }

    shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
}