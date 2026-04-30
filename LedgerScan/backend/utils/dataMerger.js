/**
 * Merges new document analysis into existing analysis data.
 * Correctly aligns columns and expands the header list if necessary.
 * 
 * @param {Object} oldData - { title, headers, rows }
 * @param {Object} newData - { title, headers, rows }
 * @returns {Object} { title, headers, rows }
 */
const mergeAnalysis = (oldData, newData) => {
  if (!oldData || !oldData.headers) return newData
  if (!newData || !newData.headers) return oldData

  const oldHeaders = oldData.headers || []
  const newHeaders = newData.headers || []
  
  // 1. Create a unified set of headers (maintain order from oldData, append new ones)
  const unifiedHeaders = [...oldHeaders]
  newHeaders.forEach(h => {
    if (!unifiedHeaders.includes(h)) {
      unifiedHeaders.push(h)
    }
  })

  // 2. Map old rows to the unified headers (pad with empty if new columns added)
  const reconciledOldRows = oldData.rows.map(row => {
    const newRow = new Array(unifiedHeaders.length).fill('')
    oldHeaders.forEach((h, i) => {
      const unifiedIdx = unifiedHeaders.indexOf(h)
      if (unifiedIdx !== -1) newRow[unifiedIdx] = row[i]
    })
    return newRow
  })

  // 3. Map new rows to the unified headers
  const reconciledNewRows = newData.rows.map(row => {
    const newRow = new Array(unifiedHeaders.length).fill('')
    newHeaders.forEach((h, i) => {
      const unifiedIdx = unifiedHeaders.indexOf(h)
      if (unifiedIdx !== -1) newRow[unifiedIdx] = row[i]
    })
    return newRow
  })

  return {
    title: oldData.title || newData.title || 'Merged Ledger Data',
    headers: unifiedHeaders,
    rows: [...reconciledOldRows, ...reconciledNewRows],
    summary: {
      documentType: 'merged_ledger',
      totalRows: reconciledOldRows.length + reconciledNewRows.length,
      mergedCount: (oldData.summary?.mergedCount || 1) + 1
    }
  }
}

module.exports = { mergeAnalysis }
