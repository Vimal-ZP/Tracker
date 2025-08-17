import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GlobalSearch from '../GlobalSearch'
import { mockFetch } from '@/__tests__/utils/test-utils'

describe('GlobalSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  it('renders search button with keyboard shortcut', () => {
    render(<GlobalSearch />)
    
    const searchButton = screen.getByRole('button')
    expect(searchButton).toBeInTheDocument()
    expect(screen.getByText('⌘K')).toBeInTheDocument()
  })

  it('opens modal when search button is clicked', async () => {
    const user = userEvent.setup()
    render(<GlobalSearch />)
    
    const searchButton = screen.getByRole('button')
    await user.click(searchButton)
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
  })

  it('opens modal with Cmd+K keyboard shortcut', () => {
    render(<GlobalSearch />)
    
    fireEvent.keyDown(document, { key: 'k', metaKey: true })
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('opens modal with Ctrl+K keyboard shortcut', () => {
    render(<GlobalSearch />)
    
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('closes modal when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<GlobalSearch />)
    
    // Open modal
    const searchButton = screen.getByRole('button')
    await user.click(searchButton)
    
    // Close modal
    const closeButton = screen.getByLabelText(/close/i)
    await user.click(closeButton)
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('performs search when user types', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      results: [
        {
          id: 'EPIC-001',
          type: 'Epic',
          title: 'Test Epic',
          release: 'Test Release',
        },
      ],
    }
    
    mockFetch({ '/api/search': mockResponse })
    
    render(<GlobalSearch />)
    
    // Open modal
    const searchButton = screen.getByRole('button')
    await user.click(searchButton)
    
    // Type in search input
    const searchInput = screen.getByPlaceholderText(/search/i)
    await user.type(searchInput, 'epic')
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/search'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('epic'),
        })
      )
    })
  })

  it('displays search results', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      results: [
        {
          id: 'EPIC-001',
          type: 'Epic',
          title: 'Test Epic',
          release: 'Test Release',
        },
        {
          id: 'FEAT-002',
          type: 'Feature',
          title: 'Test Feature',
          release: 'Test Release',
        },
      ],
    }
    
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })
    
    render(<GlobalSearch />)
    
    // Open modal and search
    const searchButton = screen.getByRole('button')
    await user.click(searchButton)
    
    const searchInput = screen.getByPlaceholderText(/search/i)
    await user.type(searchInput, 'test')
    
    await waitFor(() => {
      expect(screen.getByText('EPIC-001')).toBeInTheDocument()
      expect(screen.getByText('Test Epic')).toBeInTheDocument()
      expect(screen.getByText('FEAT-002')).toBeInTheDocument()
      expect(screen.getByText('Test Feature')).toBeInTheDocument()
    })
  })

  it('shows no results message when search returns empty', async () => {
    const user = userEvent.setup()
    const mockResponse = { results: [] }
    
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })
    
    render(<GlobalSearch />)
    
    // Open modal and search
    const searchButton = screen.getByRole('button')
    await user.click(searchButton)
    
    const searchInput = screen.getByPlaceholderText(/search/i)
    await user.type(searchInput, 'nonexistent')
    
    await waitFor(() => {
      expect(screen.getByText(/no results found/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during search', async () => {
    const user = userEvent.setup()
    
    // Mock a delayed response
    global.fetch = jest.fn().mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => 
          resolve({
            ok: true,
            json: () => Promise.resolve({ results: [] }),
          }), 100
        )
      )
    )
    
    render(<GlobalSearch />)
    
    // Open modal and search
    const searchButton = screen.getByRole('button')
    await user.click(searchButton)
    
    const searchInput = screen.getByPlaceholderText(/search/i)
    await user.type(searchInput, 'test')
    
    // Should show loading
    expect(screen.getByText(/searching/i)).toBeInTheDocument()
  })

  it('handles search API errors gracefully', async () => {
    const user = userEvent.setup()
    
    global.fetch = jest.fn().mockRejectedValue(new Error('API Error'))
    
    render(<GlobalSearch />)
    
    // Open modal and search
    const searchButton = screen.getByRole('button')
    await user.click(searchButton)
    
    const searchInput = screen.getByPlaceholderText(/search/i)
    await user.type(searchInput, 'test')
    
    await waitFor(() => {
      expect(screen.getByText(/no results found/i)).toBeInTheDocument()
    })
  })

  it('debounces search input', async () => {
    const user = userEvent.setup()
    
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ results: [] }),
    })
    
    render(<GlobalSearch />)
    
    // Open modal
    const searchButton = screen.getByRole('button')
    await user.click(searchButton)
    
    const searchInput = screen.getByPlaceholderText(/search/i)
    
    // Type quickly
    await user.type(searchInput, 'test')
    
    // Should only make one API call after debounce
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })

  it('clears results when search input is cleared', async () => {
    const user = userEvent.setup()
    
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        results: [{ id: 'EPIC-001', type: 'Epic', title: 'Test Epic', release: 'Test Release' }]
      }),
    })
    
    render(<GlobalSearch />)
    
    // Open modal and search
    const searchButton = screen.getByRole('button')
    await user.click(searchButton)
    
    const searchInput = screen.getByPlaceholderText(/search/i)
    await user.type(searchInput, 'test')
    
    await waitFor(() => {
      expect(screen.getByText('EPIC-001')).toBeInTheDocument()
    })
    
    // Clear input
    await user.clear(searchInput)
    
    expect(screen.queryByText('EPIC-001')).not.toBeInTheDocument()
  })

  it('focuses search input when modal opens', async () => {
    const user = userEvent.setup()
    render(<GlobalSearch />)
    
    const searchButton = screen.getByRole('button')
    await user.click(searchButton)
    
    const searchInput = screen.getByPlaceholderText(/search/i)
    expect(searchInput).toHaveFocus()
  })
})
