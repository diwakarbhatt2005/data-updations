import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database, Loader2, AlertCircle } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ThemeToggle } from '@/components/ThemeToggle';

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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-muted/50">
      {/* Header with Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-lg space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto flex items-center justify-center shadow-lg">
              <Database className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              Database Manager
            </h1>
            <p className="text-muted-foreground text-lg">
              Select a database to start managing your data
            </p>
          </div>

          {/* Database Selection Card */}
          <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="text-center text-xl font-semibold">
                Available Databases
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="space-y-3 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Loading databases...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Select value={selectedDb} onValueChange={setSelectedDb}>
                    <SelectTrigger className="h-12 bg-muted/50 border-border hover:bg-muted transition-colors">
                      <SelectValue placeholder="Choose a database..." />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border shadow-lg">
                      {databases.map((db) => (
                        <SelectItem 
                          key={db} 
                          value={db}
                          className="hover:bg-accent hover:text-accent-foreground cursor-pointer py-3"
                        >
                          <div className="flex items-center space-x-3">
                            <Database className="w-4 h-4 text-primary" />
                            <span className="font-medium">{db.replace('_', ' ')}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button
                    onClick={handleDatabaseSelect}
                    disabled={!selectedDb || isLoading}
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg transition-colors disabled:opacity-50"
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
                  
                  <p className="text-sm text-muted-foreground text-center">
                    {databases.length} database{databases.length !== 1 ? 's' : ''} available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};