const GRID_SIZE = 15
const DIRECTIONS = [
  [0, 1],   // horizontal derecha
  [1, 0],   // vertical abajo
  [1, 1],   // diagonal abajo-derecha
  [-1, 1],  // diagonal arriba-derecha
  [0, -1],  // horizontal izquierda
  [-1, 0],  // vertical arriba
  [-1, -1], // diagonal arriba-izquierda
  [1, -1],  // diagonal abajo-izquierda
] as const

interface PlacedWord {
  word: string
  startRow: number
  startCol: number
  direction: readonly [number, number]
  cells: { row: number; col: number }[]
}

interface WordSearchResult {
  grid: string[][]
  placedWords: PlacedWord[]
}

function createEmptyGrid(): string[][] {
  return Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(''))
}

function canPlaceWord(
  grid: string[][],
  word: string,
  startRow: number,
  startCol: number,
  direction: readonly [number, number]
): boolean {
  const [dRow, dCol] = direction
  for (let i = 0; i < word.length; i++) {
    const row = startRow + i * dRow
    const col = startCol + i * dCol

    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
      return false
    }

    const currentChar = grid[row][col]
    if (currentChar !== '' && currentChar !== word[i]) {
      return false
    }
  }
  return true
}

function placeWord(
  grid: string[][],
  word: string,
  startRow: number,
  startCol: number,
  direction: readonly [number, number]
): PlacedWord {
  const [dRow, dCol] = direction
  const cells: { row: number; col: number }[] = []

  for (let i = 0; i < word.length; i++) {
    const row = startRow + i * dRow
    const col = startCol + i * dCol
    grid[row][col] = word[i]
    cells.push({ row, col })
  }

  return { word, startRow, startCol, direction, cells }
}

function findPlacement(
  grid: string[][],
  word: string
): { row: number; col: number; direction: readonly [number, number] } | null {
  const shuffledDirections = [...DIRECTIONS].sort(() => Math.random() - 0.5)
  const attempts: { row: number; col: number; direction: readonly [number, number] }[] = []

  for (const direction of shuffledDirections) {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (canPlaceWord(grid, word, row, col, direction)) {
          attempts.push({ row, col, direction })
        }
      }
    }
  }

  if (attempts.length === 0) return null
  return attempts[Math.floor(Math.random() * attempts.length)]
}

function fillEmptyCells(grid: string[][]): void {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === '') {
        grid[row][col] = letters[Math.floor(Math.random() * letters.length)]
      }
    }
  }
}

export function generateWordSearch(words: string[]): WordSearchResult {
  const grid = createEmptyGrid()
  const placedWords: PlacedWord[] = []

  const sortedWords = [...words]
    .map((w) => w.toUpperCase().replace(/\s/g, ''))
    .sort((a, b) => b.length - a.length)

  for (const word of sortedWords) {
    if (word.length > GRID_SIZE) continue

    const placement = findPlacement(grid, word)
    if (placement) {
      const placedWord = placeWord(grid, word, placement.row, placement.col, placement.direction)
      placedWords.push(placedWord)
    }
  }

  fillEmptyCells(grid)

  return { grid, placedWords }
}

export function checkWordInGrid(
  placedWords: PlacedWord[],
  selectedCells: { row: number; col: number }[]
): string | null {
  for (const placedWord of placedWords) {
    if (selectedCells.length !== placedWord.cells.length) continue

    const matches = placedWord.cells.every((cell, index) =>
      cell.row === selectedCells[index].row && cell.col === selectedCells[index].col
    )

    const reverseMatches = placedWord.cells.every((cell, index) =>
      cell.row === selectedCells[selectedCells.length - 1 - index].row &&
      cell.col === selectedCells[selectedCells.length - 1 - index].col
    )

    if (matches || reverseMatches) {
      return placedWord.word
    }
  }

  return null
}
