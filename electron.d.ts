// interface ChartDetails {
//     name: string;
//     namespace: string;
//     values: string;
//     schema: any;
//   }
  
//   interface TemplateResult {
//     templates: Record<string, string>;
//   }
  
//   interface ElectronAPI {
//     getChartDetails: (chartPath: string) => Promise<ChartDetails>;
//     saveValues: (chartPath: string, values: string) => Promise<{ success: boolean }>;
//     templateHelm: (releaseName: string, namespace: string, valuesYaml: string, chartPath: string) => 
//       Promise<TemplateResult>;
//     selectDirectory: (options?: any) => Promise<string | null>;
//   }
  
//   interface Window {
//     electronAPI: ElectronAPI;
//   }