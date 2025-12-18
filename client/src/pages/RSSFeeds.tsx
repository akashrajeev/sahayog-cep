import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, RefreshCw, Globe, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface RSSFeed {
  name: string;
  url: string;
}

interface FetchResult {
  success: boolean;
  message: string;
  incidents: number;
  feeds: string[];
}

const RSSFeeds: React.FC = () => {
  const [availableFeeds, setAvailableFeeds] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [customFeedUrl, setCustomFeedUrl] = useState('');
  const [lastFetch, setLastFetch] = useState<FetchResult | null>(null);
  const [testResult, setTestResult] = useState<any>(null);

  // Fetch available RSS feeds on component mount
  useEffect(() => {
    fetchAvailableFeeds();
  }, []);

  const fetchAvailableFeeds = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/rss/feeds`);
      const data = await response.json();
      setAvailableFeeds(data.feeds);
    } catch (error) {
      console.error('Failed to fetch available feeds:', error);
    }
  };

  const triggerRSSFetch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/rss/fetch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      setLastFetch(result);
      
      if (result.success) {
        // Optionally refresh the incidents list or show a success message
        console.log('RSS fetch completed:', result);
      }
    } catch (error) {
      console.error('Failed to trigger RSS fetch:', error);
      setLastFetch({
        success: false,
        message: 'Failed to fetch RSS feeds',
        incidents: 0,
        feeds: []
      });
    } finally {
      setLoading(false);
    }
  };

  const testCustomFeed = async () => {
    if (!customFeedUrl.trim()) return;
    
    setTestLoading(true);
    setTestResult(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/rss/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedUrl: customFeedUrl.trim() }),
      });
      
      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      console.error('Failed to test RSS feed:', error);
      setTestResult({
        success: false,
        error: 'Failed to test RSS feed'
      });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">RSS Feed Management</h1>
        <Badge variant="outline" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Live Data Integration
        </Badge>
      </div>

      {/* Manual Fetch Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Manual RSS Fetch
          </CardTitle>
          <CardDescription>
            Manually trigger fetching of disaster data from all configured RSS feeds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={triggerRSSFetch} 
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Fetching...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Fetch RSS Feeds Now
              </>
            )}
          </Button>
          
          {lastFetch && (
            <Alert className={lastFetch.success ? "border-green-500" : "border-red-500"}>
              {lastFetch.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <AlertDescription>
                {lastFetch.message}
                {lastFetch.success && lastFetch.incidents > 0 && (
                  <span className="block mt-1 text-sm">
                    Found {lastFetch.incidents} new incidents
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Available Feeds */}
      <Card>
        <CardHeader>
          <CardTitle>Configured RSS Feeds</CardTitle>
          <CardDescription>
            These feeds are automatically checked every 30 minutes for new disaster data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {Object.entries(availableFeeds).map(([name, url]) => (
              <div key={name} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{name.replace(/_/g, ' ')}</div>
                  <div className="text-sm text-gray-500 truncate max-w-md">{url}</div>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test Custom Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Test Custom RSS Feed
          </CardTitle>
          <CardDescription>
            Test a custom RSS feed URL to see what data would be extracted
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="Enter RSS feed URL..."
              value={customFeedUrl}
              onChange={(e) => setCustomFeedUrl(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={testCustomFeed} 
              disabled={testLoading || !customFeedUrl.trim()}
              variant="outline"
            >
              {testLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                'Test Feed'
              )}
            </Button>
          </div>
          
          {testResult && (
            <Alert className={testResult.success ? "border-green-500" : "border-red-500"}>
              {testResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <AlertDescription>
                {testResult.success ? (
                  <div>
                    <div>Found {testResult.incidents} incidents in this feed</div>
                    {testResult.sampleIncidents && testResult.sampleIncidents.length > 0 && (
                      <div className="mt-2">
                        <div className="text-sm font-medium">Sample incidents:</div>
                        <ul className="text-sm list-disc list-inside mt-1">
                          {testResult.sampleIncidents.map((incident: any, index: number) => (
                            <li key={index} className="truncate">
                              {incident.type}: {incident.description.substring(0, 100)}...
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  testResult.message || 'Failed to test RSS feed'
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle>How RSS Integration Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p>• <strong>Automatic Fetching:</strong> RSS feeds are checked every 30 minutes for new disaster data</p>
            <p>• <strong>Data Sources:</strong> USGS earthquakes, GDACS alerts, ReliefWeb updates, and weather alerts</p>
            <p>• <strong>Geographic Parsing:</strong> Extracts coordinates from various RSS formats (geo:lat/lng, georss:point)</p>
            <p>• <strong>Disaster Classification:</strong> Automatically categorizes incidents (earthquake, flood, fire, storm, etc.)</p>
            <p>• <strong>Duplicate Prevention:</strong> Avoids saving duplicate incidents from the same source</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RSSFeeds;