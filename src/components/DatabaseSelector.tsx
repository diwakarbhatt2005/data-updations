import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database, Loader2, AlertCircle } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const DatabaseSelector = () => {
  const navigate = useNavigate();
  const [selectedDb, setSelectedDb] = useState<string>('');
  
  const {
    databases,
    isLoading,
    error,
    setDatabases,
    setSelectedDatabase,
    setTableData,
    setLoading,
    setError,
  } = useDashboardStore();

  // Fetch databases on component mount
  useEffect(() => {
    fetchDatabases();
  }, []);

  const fetchDatabases = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch real data from API
      const response = await fetch('http://168.231.103.13:6004/api/simulator/tables', {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success' && data.tables) {
        const tableNames = data.tables.map((table: { table_name: string; description: string | null }) => table.table_name);
        setDatabases(tableNames);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Failed to fetch databases:', err);
      setError('Failed to fetch databases. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDatabaseSelect = async () => {
    if (!selectedDb) return;

    try {
      setLoading(true);
      setError(null);
      setSelectedDatabase(selectedDb);

      // For now, using empty array - will need second API for table data
      setTableData([]);
      
      // Navigate to data view page
      navigate('/view-data');
    } catch (err) {
      setError('Failed to fetch data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-dashboard-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="bg-gradient-card shadow-elevation border-0">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-primary">
              <Database className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Database Admin Dashboard
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Select a table to view and manage your data
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Select a Table to View
              </label>
              <Select 
                value={selectedDb} 
                onValueChange={setSelectedDb}
                disabled={isLoading}
              >
                <SelectTrigger className="h-12 border-2 transition-smooth focus:border-primary hover:border-primary/50">
                  <SelectValue placeholder="Choose Table..." />
                </SelectTrigger>
                <SelectContent className="bg-white shadow-elevation border-0">
                  {databases.map((db) => (
                    <SelectItem 
                      key={db} 
                      value={db}
                      className="hover:bg-gradient-hover transition-smooth"
                    >
                      {db.replace(/_/g, ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleDatabaseSelect}
              disabled={!selectedDb || isLoading}
              className="w-full h-12 bg-gradient-primary hover:bg-primary-hover text-white font-medium shadow-primary transition-smooth disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load Table'
              )}
            </Button>

            {isLoading && !error && (
              <div className="text-center text-sm text-muted-foreground">
                Fetching table information...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};