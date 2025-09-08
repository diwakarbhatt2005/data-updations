import { useState, useMemo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Edit3, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Loader2,
  AlertCircle 
} from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

export const DataTable = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const {
    tableData,
    selectedDatabase,
    isEditMode,
    error,
    setEditMode,
    updateCell,
    addRow,
    deleteRow,
    resetToOriginal,
    setError,
  } = useDashboardStore();

  const columns = useMemo(() => {
    if (tableData.length === 0) return [];
    return Object.keys(tableData[0]);
  }, [tableData]);

  const handleCellChange = useCallback((rowIndex: number, field: string, value: string) => {
    updateCell(rowIndex, field, value);
  }, [updateCell]);

  const handlePaste = useCallback((e: React.ClipboardEvent, rowIndex: number, field: string) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const rows = pastedData.split('\n').filter(row => row.trim());
    
    // Auto-add rows if needed
    const neededRows = (rowIndex + rows.length) - tableData.length;
    if (neededRows > 0) {
      for (let i = 0; i < neededRows; i++) {
        addRow();
      }
    }
    
    let pastedCells = 0;
    rows.forEach((row, rowIndexOffset) => {
      const cells = row.split('\t');
      const currentRowIndex = rowIndex + rowIndexOffset;
      
      cells.forEach((cell, cellIndex) => {
        const fieldIndex = columns.indexOf(field) + cellIndex;
        const currentField = columns[fieldIndex];
        if (currentField && currentRowIndex < tableData.length) {
          updateCell(currentRowIndex, currentField, cell.trim());
          pastedCells++;
        }
      });
    });
    
    toast({
      title: "Data Pasted Successfully",
      description: `Pasted ${pastedCells} cells across ${rows.length} rows.`,
    });
  }, [columns, tableData, updateCell, addRow, toast]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      // Mock save - simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      setEditMode(false);
      toast({
        title: "Success",
        description: "Data updated successfully!",
      });
    } catch (err) {
      setError('Failed to save changes. Please try again.');
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (tableData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">
                {selectedDatabase?.replace('admin_panel_db/', '').replace('_', ' ').toUpperCase()}
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                {tableData.length} records • {columns.length} columns
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              {!isEditMode ? (
                <Button
                  onClick={() => setEditMode(true)}
                  className="bg-gradient-primary hover:bg-primary-hover text-white shadow-primary transition-smooth"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={resetToOriginal}
                    variant="outline"
                    className="border-destructive text-destructive hover:bg-destructive hover:text-white transition-smooth"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-accent hover:bg-accent/90 text-white shadow-primary transition-smooth"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Row Actions (only in edit mode) */}
      {isEditMode && (
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Button
                onClick={addRow}
                variant="outline"
                className="border-accent text-accent hover:bg-accent hover:text-white transition-smooth"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Row
              </Button>
              <Button
                onClick={resetToOriginal}
                variant="outline"
                className="border-muted-foreground text-muted-foreground hover:bg-muted transition-smooth"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card className="bg-gradient-card shadow-card border-0">
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[70vh] relative">
            <table className="w-full">
              <thead className="sticky top-0 bg-table-header text-white z-10 shadow-md">
                <tr>
                  {isEditMode && (
                    <th className="p-4 text-left font-medium bg-table-header">Actions</th>
                  )}
                  {columns.map((column) => (
                    <th key={column} className="p-4 text-left font-medium min-w-[150px] bg-table-header">
                      {column.replace('_', ' ').toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, rowIndex) => (
                  <tr 
                    key={rowIndex}
                    className="border-b border-table-border hover:bg-table-row-hover transition-smooth"
                  >
                    {isEditMode && (
                      <td className="p-4 sticky left-0 bg-background z-5">
                        <Button
                          onClick={() => deleteRow(rowIndex)}
                          size="sm"
                          variant="outline"
                          className="border-destructive text-destructive hover:bg-destructive hover:text-white transition-smooth"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={`${rowIndex}-${column}`} className="p-4">
                        {isEditMode ? (
                          <Input
                            value={row[column] || ''}
                            onChange={(e) => handleCellChange(rowIndex, column, e.target.value)}
                            onPaste={(e) => handlePaste(e, rowIndex, column)}
                            className="border-input focus:border-primary transition-smooth"
                            placeholder={`Enter ${column}`}
                            title={`Paste data here to auto-fill multiple cells. Row ${rowIndex + 1}, Column: ${column}`}
                          />
                        ) : (
                          <span className="text-foreground">
                            {row[column] || '-'}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Paste Instructions in Edit Mode */}
          {isEditMode && (
            <div className="p-4 border-t border-table-border bg-muted/30">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Copy-Paste Tip:</strong> Copy data from Excel/Sheets and paste in any cell. 
                Data will auto-expand to fill rows and columns. New rows will be created automatically if needed.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};