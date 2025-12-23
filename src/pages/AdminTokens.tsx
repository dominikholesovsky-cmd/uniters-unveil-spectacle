import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ArrowLeft, Download, QrCode, CheckCircle, Circle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface Token {
  id: string;
  token: string;
  is_used: boolean;
  used_at: string | null;
  created_at: string;
}

const AdminTokens = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadTokens = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("voting_tokens")
      .select("*")
      .order("created_at", { ascending: true });

    if (data) {
      setTokens(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTokens();
  }, []);

  const getBaseUrl = () => {
    return window.location.origin;
  };

  const downloadAsText = () => {
    const baseUrl = getBaseUrl();
    const content = tokens
      .map((t, index) => `${index + 1}. ${baseUrl}/portal?token=${t.token}`)
      .join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "voting-tokens.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAsCsv = () => {
    const baseUrl = getBaseUrl();
    const header = "Number,Token,URL,Used\n";
    const content = tokens
      .map((t, index) => 
        `${index + 1},${t.token},${baseUrl}/portal?token=${t.token},${t.is_used ? "Yes" : "No"}`
      )
      .join("\n");

    const blob = new Blob([header + content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "voting-tokens.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const usedCount = tokens.filter((t) => t.is_used).length;
  const unusedCount = tokens.length - usedCount;

  return (
    <>
      <Helmet>
        <title>Admin - QR Tokeny | Uniters Event</title>
      </Helmet>

      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/")}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <QrCode className="w-6 h-6 text-emerald-600" />
                  <h1 className="text-xl font-bold text-gray-800">QR Tokeny pro hlasování</h1>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={loadTokens}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Obnovit
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500">Celkem tokenů</p>
              <p className="text-2xl font-bold text-gray-800">{tokens.length}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500">Použité</p>
              <p className="text-2xl font-bold text-emerald-600">{usedCount}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500">Nepoužité</p>
              <p className="text-2xl font-bold text-blue-600">{unusedCount}</p>
            </div>
          </div>

          {/* Export buttons */}
          <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
            <h2 className="font-semibold mb-3 text-gray-800">Export URL pro QR kódy</h2>
            <p className="text-sm text-gray-500 mb-4">
              Stáhněte seznam URL adres a použijte je pro vygenerování QR kódů (např. na{" "}
              <a 
                href="https://www.qrcode-monkey.com/qr-code-api-with-logo/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                QRCode Monkey
              </a>
              {" "}nebo{" "}
              <a 
                href="https://www.the-qrcode-generator.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                QR Code Generator
              </a>
              ).
            </p>
            <div className="flex gap-3">
              <Button onClick={downloadAsText}>
                <Download className="w-4 h-4 mr-2" />
                Stáhnout TXT
              </Button>
              <Button variant="outline" onClick={downloadAsCsv}>
                <Download className="w-4 h-4 mr-2" />
                Stáhnout CSV
              </Button>
            </div>
          </div>

          {/* Token list */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-800">Seznam tokenů</h2>
            </div>
            
            {loading ? (
              <div className="p-8 text-center text-gray-500">Načítání...</div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Token</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stav</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tokens.map((token, index) => (
                      <tr key={token.id} className={token.is_used ? "bg-gray-50" : ""}>
                        <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                        <td className="px-4 py-3 font-mono text-sm">{token.token}</td>
                        <td className="px-4 py-3">
                          {token.is_used ? (
                            <span className="inline-flex items-center gap-1 text-sm text-emerald-600">
                              <CheckCircle className="w-4 h-4" />
                              Použitý
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                              <Circle className="w-4 h-4" />
                              Nepoužitý
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            /portal?token={token.token}
                          </code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminTokens;
