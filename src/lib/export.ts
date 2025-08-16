import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { WorkItem, WorkItemType } from '@/types/release';

// Helper function to get work item type display name
const getWorkItemTypeDisplay = (type: WorkItemType): string => {
    switch (type) {
        case WorkItemType.EPIC:
            return 'Epic';
        case WorkItemType.FEATURE:
            return 'Feature';
        case WorkItemType.USER_STORY:
            return 'User Story';
        case WorkItemType.BUG:
            return 'Bug';
        case WorkItemType.INCIDENT:
            return 'Incident';
        default:
            return type;
    }
};

// Helper function to flatten hierarchical work items for export
// Uses the same sorting logic as the UI table to maintain consistent order
const flattenWorkItems = (workItems: WorkItem[]): any[] => {
    const flattened: any[] = [];

    // Create a map for quick lookup
    const itemMap = new Map<string, WorkItem>();
    workItems.forEach(item => {
        if (item._id) {
            itemMap.set(item._id, item);
        }
    });

    // Helper function to get parent title
    const getParentTitle = (parentId?: string): string => {
        if (!parentId) return '';
        const parent = itemMap.get(parentId);
        return parent ? parent.title : '';
    };

    // Sort work items using the same logic as the UI table
    const sortWorkItemsForExport = (items: WorkItem[]): WorkItem[] => {
        const result: WorkItem[] = [];
        const processed = new Set<string>();

        // Helper function to add item and its children recursively
        const addItemWithChildren = (item: WorkItem) => {
            if (processed.has(item._id!)) return;

            processed.add(item._id!);
            result.push(item);

            // Find and add children in the correct order
            const children = items
                .filter(child => child.parentId === item._id)
                .sort((a, b) => {
                    // Sort children by type first, then by title
                    const typeOrder = {
                        [WorkItemType.EPIC]: 0,
                        [WorkItemType.FEATURE]: 1,
                        [WorkItemType.USER_STORY]: 2,
                        [WorkItemType.BUG]: 3,
                        [WorkItemType.INCIDENT]: 4
                    };
                    const typeComparison = typeOrder[a.type] - typeOrder[b.type];
                    if (typeComparison !== 0) return typeComparison;
                    return a.title.localeCompare(b.title);
                });

            children.forEach(child => addItemWithChildren(child));
        };

        // Start with root items (items with no parent)
        const rootItems = items
            .filter(item => !item.parentId)
            .sort((a, b) => {
                // Sort root items by type first, then by title
                const typeOrder = {
                    [WorkItemType.EPIC]: 0,
                    [WorkItemType.FEATURE]: 1,
                    [WorkItemType.USER_STORY]: 2,
                    [WorkItemType.BUG]: 3,
                    [WorkItemType.INCIDENT]: 4
                };
                const typeComparison = typeOrder[a.type] - typeOrder[b.type];
                if (typeComparison !== 0) return typeComparison;
                return a.title.localeCompare(b.title);
            });

        // Add each root item and its children
        rootItems.forEach(rootItem => addItemWithChildren(rootItem));

        return result;
    };

    // Sort items using the same logic as the UI table
    const sortedItems = sortWorkItemsForExport(workItems);

    // Convert to flat structure for export
    sortedItems.forEach(item => {
        flattened.push({
            'Type': getWorkItemTypeDisplay(item.type),
            'ID': item.id || '',
            'Title': item.title,
            'Flag Name': item.flagName || '',
            'Remarks': item.remarks || '',
            'Parent': getParentTitle(item.parentId),
            'Hyperlink': item.hyperlink || '',
            'Created Date': item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '',
            'Updated Date': item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : ''
        });
    });

    return flattened;
};

// Export work items to Excel
export const exportWorkItemsToExcel = (
    workItems: WorkItem[],
    releaseTitle: string,
    projectName: string
): void => {
    try {
        // Flatten the hierarchical data
        const flatData = flattenWorkItems(workItems);

        if (flatData.length === 0) {
            throw new Error('No work items to export');
        }

        // Create a new workbook
        const wb = XLSX.utils.book_new();

        // Create worksheet from the flattened data
        const ws = XLSX.utils.json_to_sheet(flatData);

        // Set column widths for better readability
        const colWidths = [
            { wch: 12 }, // Type
            { wch: 15 }, // ID
            { wch: 30 }, // Title
            { wch: 15 }, // Flag Name
            { wch: 25 }, // Remarks
            { wch: 25 }, // Parent
            { wch: 40 }, // Hyperlink
            { wch: 15 }, // Created Date
            { wch: 15 }  // Updated Date
        ];
        ws['!cols'] = colWidths;

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Work Items');

        // Generate Excel file buffer
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

        // Create blob and save file
        const blob = new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        // Generate filename with release and project info
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `${projectName}_${releaseTitle}_WorkItems_${timestamp}.xlsx`;

        saveAs(blob, filename);
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        throw new Error('Failed to export work items to Excel');
    }
};

// Export work items to CSV
export const exportWorkItemsToCSV = (
    workItems: WorkItem[],
    releaseTitle: string,
    projectName: string
): void => {
    try {
        // Flatten the hierarchical data
        const flatData = flattenWorkItems(workItems);

        if (flatData.length === 0) {
            throw new Error('No work items to export');
        }

        // Convert to CSV format
        const headers = Object.keys(flatData[0]);
        const csvContent = [
            headers.join(','), // Header row
            ...flatData.map(row =>
                headers.map(header => {
                    const value = row[header] || '';
                    // Escape commas and quotes in CSV
                    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                }).join(',')
            )
        ].join('\n');

        // Create blob and save file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        // Generate filename with release and project info
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `${projectName}_${releaseTitle}_WorkItems_${timestamp}.csv`;

        saveAs(blob, filename);
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        throw new Error('Failed to export work items to CSV');
    }
};

// Get export statistics
export const getExportStats = (workItems: WorkItem[]) => {
    const stats = {
        total: workItems.length,
        epics: 0,
        features: 0,
        userStories: 0,
        bugs: 0,
        incidents: 0
    };

    workItems.forEach(item => {
        switch (item.type) {
            case WorkItemType.EPIC:
                stats.epics++;
                break;
            case WorkItemType.FEATURE:
                stats.features++;
                break;
            case WorkItemType.USER_STORY:
                stats.userStories++;
                break;
            case WorkItemType.BUG:
                stats.bugs++;
                break;
            case WorkItemType.INCIDENT:
                stats.incidents++;
                break;
        }
    });

    return stats;
};
