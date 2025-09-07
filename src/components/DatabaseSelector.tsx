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
      
      // Call the actual API endpoint
      const response = await fetch('http://127.0.0.1:8000/api/databases');
      
      if (!response.ok) {
        throw new Error('Failed to fetch databases');
      }
      
      const databases = await response.json();
      setDatabases(databases);
    } catch (err) {
      setError('Failed to fetch databases. Please check your connection and try again.');
      
      // Fallback to mock data if API fails
      const mockDatabases = [
        'admin_panel_db/student_data',
        'admin_panel_db/employee_data', 
        'admin_panel_db/sales_data',
        'admin_panel_db/inventory_data',
        'admin_panel_db/customer_data'
      ];
      setDatabases(mockDatabases);
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

      // Fetch data for selected database
      const response = await fetch(`http://127.0.0.1:8000/api/data/${selectedDb}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch database data');
      }

      const data = await response.json();
      setTableData(data);
      
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
                Select a database to view and manage your data
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
                Choose Database
              </label>
              <Select 
                value={selectedDb} 
                onValueChange={setSelectedDb}
                disabled={isLoading}
              >
                <SelectTrigger className="h-12 border-2 transition-smooth focus:border-primary hover:border-primary/50">
                  <SelectValue placeholder="Select a database..." />
                </SelectTrigger>
                <SelectContent className="bg-white shadow-elevation border-0">
                  {databases.map((db) => (
                    <SelectItem 
                      key={db} 
                      value={db}
                      className="hover:bg-gradient-hover transition-smooth"
                    >
                      {db.replace('admin_panel_db/', '').replace('_', ' ').toUpperCase()}
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
                'Load Database'
              )}
            </Button>

            {isLoading && !error && (
              <div className="text-center text-sm text-muted-foreground">
                Fetching database information...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};