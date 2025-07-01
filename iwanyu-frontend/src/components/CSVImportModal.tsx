import React, { useState, useRef } from 'react';
import { X, Upload, AlertCircle, CheckCircle, Info, FileText, Cloud } from 'lucide-react';
import apiService from '../services/api';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ImportStats {
  totalProductsProcessed: number;
  importedProducts: number;
  importedVariants: number;
  importedImages: number;
  errors: string[];
}

const CSVImportModal: React.FC<CSVImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [csvPath, setCsvPath] = useState('/Users/dushimiyimanadavy/Downloads/products_export_1 2.csv');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'path'>('file');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [importResult, setImportResult] = useState<ImportStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'input' | 'preview' | 'importing' | 'completed'>('input');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv')) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Please select a valid CSV file');
        setSelectedFile(null);
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv')) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Please drop a valid CSV file');
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleAnalyzeCSV = async () => {
    if (uploadMethod === 'path' && !csvPath.trim()) {
      setError('Please enter a CSV file path');
      return;
    }

    if (uploadMethod === 'file' && !selectedFile) {
      setError('Please select a CSV file');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let response;
      if (uploadMethod === 'file' && selectedFile) {
        response = await apiService.uploadAndAnalyzeCSV(selectedFile);
      } else {
        response = await apiService.getCSVStats(csvPath);
      }

      if (response.success) {
        setStats(response.data);
        setStep('preview');
      } else {
        setError('Failed to analyze CSV file');
      }
    } catch (err) {
      setError('Error analyzing CSV file. Please check your file or path.');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    setLoading(true);
    setError(null);
    setStep('importing');

    try {
      let response;
      if (uploadMethod === 'file' && selectedFile) {
        response = await apiService.uploadAndImportCSV(selectedFile);
      } else {
        response = await apiService.importProductsFromCSV(csvPath);
      }

      if (response.success) {
        setImportResult(response.data);
        setStep('completed');
        onSuccess();
      } else {
        setError('Failed to import products');
        setStep('preview');
      }
    } catch (err) {
      setError('Error importing products from CSV');
      setStep('preview');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('input');
    setStats(null);
    setImportResult(null);
    setError(null);
    setSelectedFile(null);
    setCsvPath('/Users/dushimiyimanadavy/Downloads/products_export_1 2.csv');
    setUploadMethod('file');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Import Products from CSV</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            title="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {step === 'input' && (
            <div>
              {/* Upload Method Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose Import Method
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setUploadMethod('file')}
                    className={`flex items-center gap-3 p-4 border rounded-lg transition-colors ${
                      uploadMethod === 'file'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Cloud className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">Upload File</div>
                      <div className="text-sm text-gray-600">Upload CSV from your computer</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setUploadMethod('path')}
                    className={`flex items-center gap-3 p-4 border rounded-lg transition-colors ${
                      uploadMethod === 'path'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">File Path</div>
                      <div className="text-sm text-gray-600">Specify server file path</div>
                    </div>
                  </button>
                </div>
              </div>

              {uploadMethod === 'file' ? (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload CSV File
                  </label>
                  
                  {/* File Drop Zone */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileText className="w-8 h-8 text-blue-500" />
                        <div>
                          <p className="font-medium text-gray-900">{selectedFile.name}</p>
                          <p className="text-sm text-gray-600">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-2">
                          Drop your CSV file here
                        </p>
                        <p className="text-gray-600 mb-4">or click to browse files</p>
                        <p className="text-xs text-gray-500">
                          Supports CSV files up to 50MB
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CSV File Path
                  </label>
                  <input
                    type="text"
                    value={csvPath}
                    onChange={(e) => setCsvPath(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter the full path to your CSV file"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Example: /Users/username/Downloads/products.csv
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleAnalyzeCSV}
                  disabled={loading || (uploadMethod === 'file' && !selectedFile) || (uploadMethod === 'path' && !csvPath.trim())}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Info className="w-4 h-4" />
                  {loading ? 'Analyzing...' : 'Analyze CSV'}
                </button>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {step === 'preview' && stats && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">CSV Analysis Results</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.stats.totalProducts}</div>
                    <div className="text-sm text-blue-700">Products</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.stats.totalVariants}</div>
                    <div className="text-sm text-green-700">Variants</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{stats.stats.totalImages}</div>
                    <div className="text-sm text-purple-700">Images</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{stats.stats.categories.length}</div>
                    <div className="text-sm text-orange-700">Categories</div>
                  </div>
                </div>

                {stats.sample && stats.sample.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Sample Products:</h4>
                    <div className="space-y-2">
                      {stats.sample.map((product: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded border">
                          <div className="font-medium">{product.title}</div>
                          <div className="text-sm text-gray-600">
                            {product.variants.length} variants, {product.images.length} images
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleImport}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  {loading ? 'Importing...' : 'Import Products'}
                </button>
                <button
                  onClick={() => setStep('input')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {step === 'importing' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Importing Products...</h3>
              <p className="text-gray-600">This may take a few minutes for large CSV files.</p>
            </div>
          )}

          {step === 'completed' && importResult && (
            <div>
              <div className="text-center mb-6">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Import Completed!</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{importResult.importedProducts}</div>
                  <div className="text-sm text-green-700">Products Imported</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{importResult.importedVariants}</div>
                  <div className="text-sm text-blue-700">Variants Created</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{importResult.importedImages}</div>
                  <div className="text-sm text-purple-700">Images Added</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{importResult.totalProductsProcessed}</div>
                  <div className="text-sm text-orange-700">Total Processed</div>
                </div>
              </div>

              {importResult.errors && importResult.errors.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Import Warnings:</h4>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-h-32 overflow-y-auto">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="text-sm text-yellow-800 mb-1">
                        • {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleClose}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CSVImportModal;
