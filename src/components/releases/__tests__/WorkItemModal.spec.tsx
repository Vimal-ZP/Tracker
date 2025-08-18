import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WorkItemModal, { WorkItemFormData } from '../WorkItemModal'
import { WorkItem, WorkItemType } from '@/types/release'

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  X: (props: any) => <div data-testid="x-icon" {...props}>X</div>,
}))

describe('WorkItemModal', () => {
  const mockOnClose = jest.fn()
  const mockOnSubmit = jest.fn()

  const mockWorkItem: WorkItem = {
    _id: 'work-1',
    type: WorkItemType.EPIC,
    id: 'EPIC-001',
    title: 'Test Epic',
    flagName: 'epic-flag',
    remarks: 'Epic remarks',
    hyperlink: 'http://example.com/epic',
    parentId: '',
    children: []
  }

  const mockParentItem: WorkItem = {
    _id: 'parent-1',
    type: WorkItemType.EPIC,
    id: 'EPIC-PARENT',
    title: 'Parent Epic',
    flagName: 'parent-flag',
    remarks: 'Parent remarks',
    hyperlink: 'http://example.com/parent',
    parentId: '',
    children: []
  }

  const mockAvailableParents: WorkItem[] = [
    mockParentItem,
    {
      _id: 'parent-2',
      type: WorkItemType.FEATURE,
      id: 'FEAT-PARENT',
      title: 'Parent Feature',
      flagName: 'feature-flag',
      remarks: 'Feature remarks',
      hyperlink: 'http://example.com/feature',
      parentId: 'parent-1',
      children: []
    }
  ]

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
    mode: 'create' as const,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Modal Rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<WorkItemModal {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Create Work Item')).toBeInTheDocument()
    })

    it('should not render modal when isOpen is false', () => {
      render(<WorkItemModal {...defaultProps} isOpen={false} />)

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should render close button', () => {
      render(<WorkItemModal {...defaultProps} />)

      expect(screen.getByTestId('x-icon')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
    })

    it('should render all form fields', () => {
      render(<WorkItemModal {...defaultProps} />)

      expect(screen.getByLabelText(/Type/)).toBeInTheDocument()
      expect(screen.getByLabelText(/ID/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Title/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Flag Name/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Remarks/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Hyperlink/)).toBeInTheDocument()
    })
  })

  describe('Mode-specific Behavior', () => {
    describe('Create Mode', () => {
      it('should show create title', () => {
        render(<WorkItemModal {...defaultProps} mode="create" />)

        expect(screen.getByText('Create Work Item')).toBeInTheDocument()
      })

      it('should default to Epic type', () => {
        render(<WorkItemModal {...defaultProps} mode="create" />)

        const typeSelect = screen.getByLabelText(/Type/)
        expect(typeSelect).toHaveValue(WorkItemType.EPIC)
      })

      it('should enable type selection in create mode', () => {
        render(<WorkItemModal {...defaultProps} mode="create" />)

        const typeSelect = screen.getByLabelText(/Type/)
        expect(typeSelect).not.toBeDisabled()
      })
    })

    describe('Edit Mode', () => {
      it('should show edit title', () => {
        render(
          <WorkItemModal
            {...defaultProps}
            mode="edit"
            workItem={mockWorkItem}
          />
        )

        expect(screen.getByText('Edit Work Item')).toBeInTheDocument()
      })

      it('should populate form with work item data', () => {
        render(
          <WorkItemModal
            {...defaultProps}
            mode="edit"
            workItem={mockWorkItem}
          />
        )

        expect(screen.getByDisplayValue('EPIC-001')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Test Epic')).toBeInTheDocument()
        expect(screen.getByDisplayValue('epic-flag')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Epic remarks')).toBeInTheDocument()
        expect(screen.getByDisplayValue('http://example.com/epic')).toBeInTheDocument()
      })

      it('should disable type field in edit mode', () => {
        render(
          <WorkItemModal
            {...defaultProps}
            mode="edit"
            workItem={mockWorkItem}
          />
        )

        const typeSelect = screen.getByLabelText(/Type/)
        expect(typeSelect).toBeDisabled()
      })
    })

    describe('Create Child Mode', () => {
      it('should show create child title', () => {
        render(
          <WorkItemModal
            {...defaultProps}
            mode="createChild"
            parentItem={mockParentItem}
          />
        )

        expect(screen.getByText('Create Child Work Item')).toBeInTheDocument()
      })

      it('should set correct child type for Epic parent', () => {
        render(
          <WorkItemModal
            {...defaultProps}
            mode="createChild"
            parentItem={{ ...mockParentItem, type: WorkItemType.EPIC }}
          />
        )

        const typeSelect = screen.getByLabelText(/Type/)
        expect(typeSelect).toHaveValue(WorkItemType.FEATURE)
      })

      it('should set correct child type for Feature parent', () => {
        render(
          <WorkItemModal
            {...defaultProps}
            mode="createChild"
            parentItem={{ ...mockParentItem, type: WorkItemType.FEATURE }}
          />
        )

        const typeSelect = screen.getByLabelText(/Type/)
        expect(typeSelect).toHaveValue(WorkItemType.USER_STORY)
      })

      it('should set correct child type for User Story parent', () => {
        render(
          <WorkItemModal
            {...defaultProps}
            mode="createChild"
            parentItem={{ ...mockParentItem, type: WorkItemType.USER_STORY }}
          />
        )

        const typeSelect = screen.getByLabelText(/Type/)
        expect(typeSelect).toHaveValue(WorkItemType.BUG)
      })

      it('should set parent ID correctly', () => {
        render(
          <WorkItemModal
            {...defaultProps}
            mode="createChild"
            parentItem={mockParentItem}
          />
        )

        const parentSelect = screen.getByLabelText(/Parent/)
        expect(parentSelect).toHaveValue('parent-1')
      })
    })

    describe('Create Epic Mode', () => {
      it('should show create epic title', () => {
        render(<WorkItemModal {...defaultProps} mode="createEpic" />)

        expect(screen.getByText('Create Epic')).toBeInTheDocument()
      })

      it('should fix type to Epic', () => {
        render(<WorkItemModal {...defaultProps} mode="createEpic" />)

        const typeSelect = screen.getByLabelText(/Type/)
        expect(typeSelect).toHaveValue(WorkItemType.EPIC)
        expect(typeSelect).toBeDisabled()
      })
    })

    describe('Create Incident Mode', () => {
      it('should show create incident title', () => {
        render(<WorkItemModal {...defaultProps} mode="createIncident" />)

        expect(screen.getByText('Create Incident')).toBeInTheDocument()
      })

      it('should fix type to Incident', () => {
        render(<WorkItemModal {...defaultProps} mode="createIncident" />)

        const typeSelect = screen.getByLabelText(/Type/)
        expect(typeSelect).toHaveValue(WorkItemType.INCIDENT)
        expect(typeSelect).toBeDisabled()
      })
    })
  })

  describe('Form Interactions', () => {
    beforeEach(() => {
      render(<WorkItemModal {...defaultProps} />)
    })

    it('should update type field', async () => {
      const user = userEvent.setup()
      const typeSelect = screen.getByLabelText(/Type/)

      await user.selectOptions(typeSelect, WorkItemType.FEATURE)

      expect(typeSelect).toHaveValue(WorkItemType.FEATURE)
    })

    it('should update ID field', async () => {
      const user = userEvent.setup()
      const idInput = screen.getByLabelText(/ID/)

      await user.type(idInput, 'EPIC-123')

      expect(idInput).toHaveValue('EPIC-123')
    })

    it('should update title field', async () => {
      const user = userEvent.setup()
      const titleInput = screen.getByLabelText(/Title/)

      await user.type(titleInput, 'Test Title')

      expect(titleInput).toHaveValue('Test Title')
    })

    it('should update flag name field', async () => {
      const user = userEvent.setup()
      const flagInput = screen.getByLabelText(/Flag Name/)

      await user.type(flagInput, 'test-flag')

      expect(flagInput).toHaveValue('test-flag')
    })

    it('should update remarks field', async () => {
      const user = userEvent.setup()
      const remarksTextarea = screen.getByLabelText(/Remarks/)

      await user.type(remarksTextarea, 'Test remarks')

      expect(remarksTextarea).toHaveValue('Test remarks')
    })

    it('should update hyperlink field', async () => {
      const user = userEvent.setup()
      const hyperlinkInput = screen.getByLabelText(/Hyperlink/)

      await user.type(hyperlinkInput, 'http://example.com')

      expect(hyperlinkInput).toHaveValue('http://example.com')
    })
  })

  describe('Parent Selection', () => {
    it('should show parent select when available parents exist', () => {
      render(
        <WorkItemModal
          {...defaultProps}
          availableParents={mockAvailableParents}
        />
      )

      expect(screen.getByLabelText(/Parent/)).toBeInTheDocument()
    })

    it('should populate parent options', () => {
      render(
        <WorkItemModal
          {...defaultProps}
          availableParents={mockAvailableParents}
        />
      )

      expect(screen.getByText('Parent Epic')).toBeInTheDocument()
      expect(screen.getByText('Parent Feature')).toBeInTheDocument()
    })

    it('should not show parent select when no available parents', () => {
      render(<WorkItemModal {...defaultProps} availableParents={[]} />)

      expect(screen.queryByLabelText(/Parent/)).not.toBeInTheDocument()
    })

    it('should update parent selection', async () => {
      const user = userEvent.setup()
      render(
        <WorkItemModal
          {...defaultProps}
          availableParents={mockAvailableParents}
        />
      )

      const parentSelect = screen.getByLabelText(/Parent/)
      await user.selectOptions(parentSelect, 'parent-1')

      expect(parentSelect).toHaveValue('parent-1')
    })
  })

  describe('Form Validation', () => {
    beforeEach(() => {
      render(<WorkItemModal {...defaultProps} />)
    })

    it('should show error for empty ID', async () => {
      const user = userEvent.setup()
      const submitButton = screen.getByRole('button', { name: /create/i })

      await user.click(submitButton)

      expect(screen.getByText('ID is required')).toBeInTheDocument()
    })

    it('should show error for empty title', async () => {
      const user = userEvent.setup()
      const idInput = screen.getByLabelText(/ID/)
      const submitButton = screen.getByRole('button', { name: /create/i })

      await user.type(idInput, 'EPIC-123')
      await user.click(submitButton)

      expect(screen.getByText('Title is required')).toBeInTheDocument()
    })

    it('should show error for empty hyperlink', async () => {
      const user = userEvent.setup()
      const idInput = screen.getByLabelText(/ID/)
      const titleInput = screen.getByLabelText(/Title/)
      const submitButton = screen.getByRole('button', { name: /create/i })

      await user.type(idInput, 'EPIC-123')
      await user.type(titleInput, 'Test Title')
      await user.click(submitButton)

      expect(screen.getByText('Hyperlink is required')).toBeInTheDocument()
    })

    it('should show error for invalid hyperlink format', async () => {
      const user = userEvent.setup()
      const idInput = screen.getByLabelText(/ID/)
      const titleInput = screen.getByLabelText(/Title/)
      const hyperlinkInput = screen.getByLabelText(/Hyperlink/)
      const submitButton = screen.getByRole('button', { name: /create/i })

      await user.type(idInput, 'EPIC-123')
      await user.type(titleInput, 'Test Title')
      await user.type(hyperlinkInput, 'invalid-url')
      await user.click(submitButton)

      expect(screen.getByText('Hyperlink must be a valid URL starting with http:// or https://')).toBeInTheDocument()
    })

    it('should accept valid http URL', async () => {
      const user = userEvent.setup()
      const idInput = screen.getByLabelText(/ID/)
      const titleInput = screen.getByLabelText(/Title/)
      const hyperlinkInput = screen.getByLabelText(/Hyperlink/)
      const submitButton = screen.getByRole('button', { name: /create/i })

      await user.type(idInput, 'EPIC-123')
      await user.type(titleInput, 'Test Title')
      await user.type(hyperlinkInput, 'http://example.com')
      await user.click(submitButton)

      expect(screen.queryByText('Hyperlink must be a valid URL starting with http:// or https://')).not.toBeInTheDocument()
    })

    it('should accept valid https URL', async () => {
      const user = userEvent.setup()
      const idInput = screen.getByLabelText(/ID/)
      const titleInput = screen.getByLabelText(/Title/)
      const hyperlinkInput = screen.getByLabelText(/Hyperlink/)
      const submitButton = screen.getByRole('button', { name: /create/i })

      await user.type(idInput, 'EPIC-123')
      await user.type(titleInput, 'Test Title')
      await user.type(hyperlinkInput, 'https://example.com')
      await user.click(submitButton)

      expect(screen.queryByText('Hyperlink must be a valid URL starting with http:// or https://')).not.toBeInTheDocument()
    })

    it('should clear errors when user starts typing', async () => {
      const user = userEvent.setup()
      const idInput = screen.getByLabelText(/ID/)
      const submitButton = screen.getByRole('button', { name: /create/i })

      // Trigger error
      await user.click(submitButton)
      expect(screen.getByText('ID is required')).toBeInTheDocument()

      // Clear error by typing
      await user.type(idInput, 'EPIC-123')
      expect(screen.queryByText('ID is required')).not.toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    beforeEach(() => {
      render(<WorkItemModal {...defaultProps} />)
    })

    it('should submit valid form data', async () => {
      const user = userEvent.setup()

      await user.type(screen.getByLabelText(/ID/), 'EPIC-123')
      await user.type(screen.getByLabelText(/Title/), 'Test Title')
      await user.type(screen.getByLabelText(/Flag Name/), 'test-flag')
      await user.type(screen.getByLabelText(/Remarks/), 'Test remarks')
      await user.type(screen.getByLabelText(/Hyperlink/), 'http://example.com')

      await user.click(screen.getByRole('button', { name: /create/i }))

      expect(mockOnSubmit).toHaveBeenCalledWith({
        type: WorkItemType.EPIC,
        id: 'EPIC-123',
        title: 'Test Title',
        flagName: 'test-flag',
        remarks: 'Test remarks',
        hyperlink: 'http://example.com',
        parentId: ''
      })
    })

    it('should not submit invalid form', async () => {
      const user = userEvent.setup()

      await user.click(screen.getByRole('button', { name: /create/i }))

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should submit with parent ID when selected', async () => {
      render(
        <WorkItemModal
          {...defaultProps}
          availableParents={mockAvailableParents}
        />
      )

      const user = userEvent.setup()

      await user.type(screen.getByLabelText(/ID/), 'FEAT-123')
      await user.type(screen.getByLabelText(/Title/), 'Test Feature')
      await user.type(screen.getByLabelText(/Hyperlink/), 'http://example.com')
      await user.selectOptions(screen.getByLabelText(/Parent/), 'parent-1')

      await user.click(screen.getByRole('button', { name: /create/i }))

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          parentId: 'parent-1'
        })
      )
    })
  })

  describe('Modal Closing', () => {
    beforeEach(() => {
      render(<WorkItemModal {...defaultProps} />)
    })

    it('should close modal when close button is clicked', async () => {
      const user = userEvent.setup()

      await user.click(screen.getByRole('button', { name: /close/i }))

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should close modal when cancel button is clicked', async () => {
      const user = userEvent.setup()

      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should close modal on outside click', async () => {
      const user = userEvent.setup()

      await user.click(screen.getByRole('dialog').parentElement!)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should close modal on escape key', async () => {
      const user = userEvent.setup()

      await user.keyboard('{Escape}')

      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('Work Item Types', () => {
    beforeEach(() => {
      render(<WorkItemModal {...defaultProps} />)
    })

    it('should have all work item type options', () => {
      expect(screen.getByRole('option', { name: 'Epic' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Feature' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'User Story' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Bug' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Incident' })).toBeInTheDocument()
    })

    it('should update type selection', async () => {
      const user = userEvent.setup()
      const typeSelect = screen.getByLabelText(/Type/)

      await user.selectOptions(typeSelect, WorkItemType.BUG)

      expect(typeSelect).toHaveValue(WorkItemType.BUG)
    })
  })

  describe('Field Error Styling', () => {
    beforeEach(() => {
      render(<WorkItemModal {...defaultProps} />)
    })

    it('should apply error styling to invalid fields', async () => {
      const user = userEvent.setup()
      const submitButton = screen.getByRole('button', { name: /create/i })

      await user.click(submitButton)

      const idInput = screen.getByLabelText(/ID/)
      const titleInput = screen.getByLabelText(/Title/)
      const hyperlinkInput = screen.getByLabelText(/Hyperlink/)

      expect(idInput).toHaveClass('border-red-300')
      expect(titleInput).toHaveClass('border-red-300')
      expect(hyperlinkInput).toHaveClass('border-red-300')
    })

    it('should remove error styling when field becomes valid', async () => {
      const user = userEvent.setup()
      const idInput = screen.getByLabelText(/ID/)
      const submitButton = screen.getByRole('button', { name: /create/i })

      // Trigger error
      await user.click(submitButton)
      expect(idInput).toHaveClass('border-red-300')

      // Fix error
      await user.type(idInput, 'EPIC-123')
      expect(idInput).not.toHaveClass('border-red-300')
      expect(idInput).toHaveClass('border-gray-300')
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing work item in edit mode', () => {
      render(
        <WorkItemModal
          {...defaultProps}
          mode="edit"
          workItem={undefined}
        />
      )

      // Should render without crashing
      expect(screen.getByText('Edit Work Item')).toBeInTheDocument()
    })

    it('should handle missing parent item in createChild mode', () => {
      render(
        <WorkItemModal
          {...defaultProps}
          mode="createChild"
          parentItem={undefined}
        />
      )

      // Should render without crashing
      expect(screen.getByText('Create Child Work Item')).toBeInTheDocument()
    })

    it('should handle work item with missing optional fields', () => {
      const incompleteWorkItem: WorkItem = {
        _id: 'work-1',
        type: WorkItemType.EPIC,
        id: 'EPIC-001',
        title: 'Test Epic',
        flagName: '',
        remarks: '',
        hyperlink: 'http://example.com',
        parentId: '',
        children: []
      }

      render(
        <WorkItemModal
          {...defaultProps}
          mode="edit"
          workItem={incompleteWorkItem}
        />
      )

      expect(screen.getByDisplayValue('EPIC-001')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test Epic')).toBeInTheDocument()
      expect(screen.getByDisplayValue('')).toBeInTheDocument() // Empty flag name
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      render(<WorkItemModal {...defaultProps} />)
    })

    it('should have proper form labels', () => {
      expect(screen.getByLabelText(/Type/)).toBeInTheDocument()
      expect(screen.getByLabelText(/ID/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Title/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Flag Name/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Remarks/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Hyperlink/)).toBeInTheDocument()
    })

    it('should have proper button roles', () => {
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument()
    })

    it('should have proper dialog role', () => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should associate error messages with fields', async () => {
      const user = userEvent.setup()
      const submitButton = screen.getByRole('button', { name: /create/i })

      await user.click(submitButton)

      const idInput = screen.getByLabelText(/ID/)
      const idError = screen.getByText('ID is required')

      expect(idInput).toHaveAttribute('aria-describedby')
      expect(idError.id).toBeTruthy()
    })
  })
})
