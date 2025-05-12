import React, { useState } from 'react';

interface ChartDetails {
  name: string;
  namespace: string;
  values: string;
  schema: any;
}

interface TemplateResult {
  templates: Record<string, string>;
}

const ChartFileTest: React.FC = () => {
  const [chartPath, setChartPath] = useState<string | null>(null);
  const [chartDetails, setChartDetails] = useState<ChartDetails | null>(null);
  const [valuesText, setValuesText] = useState<string>('');
  const [templateResult, setTemplateResult] = useState<TemplateResult | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');

  // Select a chart directory
  const handleSelectChart = async () => {
    try {
      setStatus('Selecting directory...');
      const selectedPath = await window.electronAPI.selectDirectory();
      if (selectedPath) {
        setChartPath(selectedPath);
        await loadChartDetails(selectedPath);
      } else {
        setStatus('Directory selection cancelled');
      }
    } catch (error) {
      setStatus(`Error selecting directory: ${error}`);
      console.error('Error selecting directory:', error);
    }
  };

  // Load chart details from the selected path
  const loadChartDetails = async (path: string) => {
    try {
      setStatus('Loading chart details...');
      const details = await window.electronAPI.getChartDetails(path);
      setChartDetails(details);
      setValuesText(details.values);
      setStatus(`Loaded chart: ${details.name}`);
    } catch (error) {
      setStatus(`Error loading chart details: ${error}`);
      console.error('Error loading chart details:', error);
    }
  };

  // Save values back to the chart
  const saveValues = async () => {
    if (!chartPath) return;

    try {
      setStatus('Saving values...');
      await window.electronAPI.saveValues(chartPath, valuesText);
      setStatus('Values saved successfully');
    } catch (error) {
      setStatus(`Error saving values: ${error}`);
      console.error('Error saving values:', error);
    }
  };

  // Generate Helm templates
  const generateTemplates = async () => {
    if (!chartPath || !chartDetails) return;

    try {
      setStatus('Generating templates...');
      const result = await window.electronAPI.templateHelm(
        chartDetails.name,
        chartDetails.namespace,
        valuesText,
        chartPath
      );
      setTemplateResult(result);
      setStatus('Templates generated successfully');

      // Select the first template by default
      const templateKeys = Object.keys(result.templates);
      if (templateKeys.length > 0) {
        setSelectedTemplate(templateKeys[0]);
      }
    } catch (error) {
      setStatus(`Error generating templates: ${error}`);
      console.error('Error generating templates:', error);
    }
  };

  return (
    <div className="chart-file-test" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Helm Chart File Access Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleSelectChart}
          style={{ padding: '8px 16px', marginRight: '10px' }}
        >
          Select Helm Chart Directory
        </button>
        
        {chartPath && (
          <span>Selected: <strong>{chartPath}</strong></span>
        )}
      </div>
      
      <div style={{ color: '#666', marginBottom: '20px' }}>
        Status: {status}
      </div>
      
      {chartDetails && (
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <h2>Chart: {chartDetails.name}</h2>
            <h3>Values</h3>
            <textarea
              value={valuesText}
              onChange={(e) => setValuesText(e.target.value)}
              style={{ width: '100%', height: '400px', fontFamily: 'monospace' }}
            />
            <div style={{ marginTop: '10px' }}>
              <button 
                onClick={saveValues}
                style={{ padding: '8px 16px', marginRight: '10px' }}
              >
                Save Values
              </button>
              <button 
                onClick={generateTemplates}
                style={{ padding: '8px 16px' }}
              >
                Generate Templates
              </button>
            </div>
          </div>
          
          {templateResult && (
            <div style={{ flex: 1 }}>
              <h3>Generated Templates</h3>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <select 
                  value={selectedTemplate || ''}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  style={{ flex: 1 }}
                >
                  {Object.keys(templateResult.templates).map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>
              
              {selectedTemplate && (
                <pre 
                  style={{ 
                    height: '400px', 
                    overflow: 'auto', 
                    backgroundColor: '#808080',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontFamily: 'monospace'
                  }}
                >
                  {templateResult.templates[selectedTemplate]}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChartFileTest;