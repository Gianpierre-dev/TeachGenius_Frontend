import { useState, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateWordSearch, checkWordInGrid } from '../../lib/wordSearchGenerator'

interface WordSearchProps {
  words: string[]
  onWordFound: (word: string) => void
  foundWords: string[]
}

interface Cell {
  row: number
  col: number
}

export default function WordSearch({ words, onWordFound, foundWords }: WordSearchProps) {
  const [selecting, setSelecting] = useState(false)
  const [selectedCells, setSelectedCells] = useState<Cell[]>([])
  const [lastFoundWord, setLastFoundWord] = useState<string | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const { grid, placedWords } = useMemo(() => generateWordSearch(words), [words])

  const foundWordCells = useMemo(() => {
    const cells = new Set<string>()
    placedWords.forEach((pw) => {
      if (foundWords.includes(pw.word)) {
        pw.cells.forEach((cell) => cells.add(`${cell.row}-${cell.col}`))
      }
    })
    return cells
  }, [placedWords, foundWords])

  const getCellFromEvent = useCallback(
    (e: React.TouchEvent | React.MouseEvent): Cell | null => {
      if (!gridRef.current) return null

      const rect = gridRef.current.getBoundingClientRect()
      const cellSize = rect.width / grid.length

      let clientX: number
      let clientY: number

      if ('touches' in e) {
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      } else {
        clientX = e.clientX
        clientY = e.clientY
      }

      const col = Math.floor((clientX - rect.left) / cellSize)
      const row = Math.floor((clientY - rect.top) / cellSize)

      if (row >= 0 && row < grid.length && col >= 0 && col < grid.length) {
        return { row, col }
      }
      return null
    },
    [grid.length]
  )

  const isValidSelection = useCallback((cells: Cell[], newCell: Cell): boolean => {
    if (cells.length === 0) return true
    if (cells.length === 1) return true

    const firstCell = cells[0]
    const lastCell = cells[cells.length - 1]

    const dRow = lastCell.row - firstCell.row
    const dCol = lastCell.col - firstCell.col

    const expectedRow = lastCell.row + Math.sign(dRow)
    const expectedCol = lastCell.col + Math.sign(dCol)

    if (dRow === 0) {
      return newCell.row === lastCell.row && Math.abs(newCell.col - lastCell.col) === 1
    }
    if (dCol === 0) {
      return newCell.col === lastCell.col && Math.abs(newCell.row - lastCell.row) === 1
    }

    return newCell.row === expectedRow && newCell.col === expectedCol
  }, [])

  const handleStart = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault()
      const cell = getCellFromEvent(e)
      if (cell) {
        setSelecting(true)
        setSelectedCells([cell])
      }
    },
    [getCellFromEvent]
  )

  const handleMove = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!selecting) return
      e.preventDefault()

      const cell = getCellFromEvent(e)
      if (!cell) return

      const alreadySelected = selectedCells.some(
        (c) => c.row === cell.row && c.col === cell.col
      )

      if (!alreadySelected && isValidSelection(selectedCells, cell)) {
        setSelectedCells([...selectedCells, cell])
      }
    },
    [selecting, selectedCells, getCellFromEvent, isValidSelection]
  )

  const handleEnd = useCallback(() => {
    if (!selecting) return
    setSelecting(false)

    const foundWord = checkWordInGrid(placedWords, selectedCells)
    if (foundWord && !foundWords.includes(foundWord)) {
      setLastFoundWord(foundWord)
      onWordFound(foundWord)
      setTimeout(() => setLastFoundWord(null), 1000)
    }

    setSelectedCells([])
  }, [selecting, selectedCells, placedWords, foundWords, onWordFound])

  const isCellSelected = useCallback(
    (row: number, col: number) => {
      return selectedCells.some((c) => c.row === row && c.col === col)
    },
    [selectedCells]
  )

  const isCellFound = useCallback(
    (row: number, col: number) => {
      return foundWordCells.has(`${row}-${col}`)
    },
    [foundWordCells]
  )

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence>
        {lastFoundWord && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center mb-4"
          >
            <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full font-bold">
              {lastFoundWord}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        ref={gridRef}
        className="aspect-square bg-white rounded-2xl shadow-lg p-2 touch-action-none select-none"
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        <div
          className="grid h-full w-full gap-0.5"
          style={{ gridTemplateColumns: `repeat(${grid.length}, 1fr)` }}
        >
          {grid.map((row, rowIndex) =>
            row.map((letter, colIndex) => {
              const selected = isCellSelected(rowIndex, colIndex)
              const found = isCellFound(rowIndex, colIndex)

              return (
                <motion.div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                    flex items-center justify-center
                    text-sm md:text-base font-bold rounded
                    transition-colors duration-150
                    ${selected ? 'bg-primary-500 text-white' : ''}
                    ${found && !selected ? 'bg-green-500 text-white' : ''}
                    ${!selected && !found ? 'bg-gray-100 text-gray-800' : ''}
                  `}
                  animate={found ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {letter}
                </motion.div>
              )
            })
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {words.map((word) => (
          <span
            key={word}
            className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${foundWords.includes(word.toUpperCase())
                ? 'bg-green-100 text-green-700 line-through'
                : 'bg-gray-200 text-gray-700'}
            `}
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  )
}
