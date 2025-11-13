"use client";

import React, { useState, useEffect } from "react";
import {
  Send,
  Eye,
  Calendar,
  Download,
  Trash2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { motion } from "framer-motion";

// Supabase Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function DailyManifesto() {
  const [view, setView] = useState("write");
  const [manifesto, setManifesto] = useState("");
  const [author, setAuthor] = useState("");
  const [myManifestos, setMyManifestos] = useState([]);
  const [publicManifestos, setPublicManifestos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showClearAll, setShowClearAll] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);

  useEffect(() => {
    const configured =
      SUPABASE_URL !== "YOUR_SUPABASE_URL" &&
      SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY";
    setSupabaseConfigured(configured);
  }, []);

const supabaseRequest = async (endpoint, method = "GET", body = null) => {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Prefer: "return=representation",
    },
  };

  if (body) {
    options.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/${endpoint}`,
    options
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error: ${response.statusText} - ${errorText}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

  const loadData = async () => {
    try {
      if (supabaseConfigured) {
        let userId = localStorage.getItem("userId");
        if (!userId) {
          userId = `user_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;
          localStorage.setItem("userId", userId);
        }

        const [myData, publicData] = await Promise.all([
          supabaseRequest(
            `manifestos?user_id=eq.${userId}&select=*&order=created_at.desc`
          ),
          supabaseRequest(
            "manifestos?select=*&order=created_at.desc&limit=100"
          ),
        ]);

        if (myData) setMyManifestos(myData);
        if (publicData) setPublicManifestos(publicData);
      } else {
        const savedMy = localStorage.getItem("myManifestos");
        const savedPublic = localStorage.getItem("publicManifestos");
        if (savedMy) setMyManifestos(JSON.parse(savedMy));
        if (savedPublic) setPublicManifestos(JSON.parse(savedPublic));
      }
    } catch (error) {
      console.error("Error loading:", error);
      const savedMy = localStorage.getItem("myManifestos");
      const savedPublic = localStorage.getItem("publicManifestos");
      if (savedMy) setMyManifestos(JSON.parse(savedMy));
      if (savedPublic) setPublicManifestos(JSON.parse(savedPublic));
    }
  };

  useEffect(() => {
    const init = async () => {
      setDataLoading(true);
      await loadData();
      setDataLoading(false);
    };
    init();
  }, [supabaseConfigured]);

  useEffect(() => {
    if (!dataLoading && !supabaseConfigured) {
      localStorage.setItem("myManifestos", JSON.stringify(myManifestos));
      localStorage.setItem(
        "publicManifestos",
        JSON.stringify(publicManifestos)
      );
    }
  }, [myManifestos, publicManifestos, dataLoading, supabaseConfigured]);

  // 🌍 Global & Consistent Daily Quote Logic
  const [dailyQuote, setDailyQuote] = useState(null);

  useEffect(() => {
    const fetchDailyQuote = async () => {
      if (!supabaseConfigured) return;

      try {
        const today = new Date().toISOString().slice(0, 10);

        // ✅ First, check if today's quote is already selected server-side
        const existingDaily = await supabaseRequest(
          `daily_quotes?select=quote_id,manifestos(*)&date=eq.${today}`
        );

        if (
          existingDaily &&
          existingDaily.length > 0 &&
          existingDaily[0].manifestos
        ) {
          // Use the server-selected quote
          setDailyQuote(existingDaily[0].manifestos);
          return;
        }

        // ✅ If no quote exists for today, select one
        const quotes = await supabaseRequest(
          "manifestos?select=*&order=created_at.asc"
        );

        if (!quotes || quotes.length === 0) {
          setDailyQuote(null);
          return;
        }

        // Generate deterministic index from date
        quotes.sort((a, b) => a.created_at.localeCompare(b.created_at));
        const dateHash = [...today].reduce(
          (acc, char) => acc + char.charCodeAt(0),
          0
        );
        const index = dateHash % quotes.length;
        const selectedQuote = quotes[index];

        // ✅ Store the selection server-side (attempt, ignore conflicts)
        try {
          await supabaseRequest("daily_quotes", "POST", {
            date: today,
            quote_id: selectedQuote.id,
          });
        } catch (insertError) {
          // Ignore duplicate key errors (race condition handled)
          console.log("Daily quote already exists");
        }

        setDailyQuote(selectedQuote);
      } catch (error) {
        console.error("Error fetching daily quote:", error);
        setDailyQuote(null);
      }
    };

    // Initial fetch
    fetchDailyQuote();

    // Re-check when user returns to the tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchDailyQuote();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [supabaseConfigured]);

  // 🌟 Smooth View Switching with Data Refresh
  const switchView = async (newView) => {
    setView(newView);
    setDataLoading(true);
    await loadData();
    setDataLoading(false);
  };

  const refreshCommunity = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const publishManifesto = async () => {
    if (!manifesto.trim() || !author.trim()) return;
    setLoading(true);

    try {
      const manifestoData = {
        text: manifesto,
        author: author,
        date: new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      };

      if (supabaseConfigured) {
        const userId = localStorage.getItem("userId");
        const dataToSave = { ...manifestoData, user_id: userId };

        const result = await supabaseRequest("manifestos", "POST", dataToSave);
        if (result && result.length > 0) {
          setMyManifestos((prev) => [result[0], ...prev]);
          setPublicManifestos((prev) => [result[0], ...prev]);
        }
      } else {
        const dataWithId = {
          ...manifestoData,
          id: Date.now(),
          user_id: "local",
          created_at: new Date().toISOString(),
        };
        setMyManifestos((prev) => [dataWithId, ...prev]);
        setPublicManifestos((prev) => [dataWithId, ...prev]);
      }

      setManifesto("");
      setAuthor("");
      setView("mine");
    } catch (error) {
      console.error("Error publishing:", error);
      alert("Failed to publish. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteManifesto = async (id) => {
    try {
      if (supabaseConfigured) {
        await supabaseRequest(`manifestos?id=eq.${id}`, "DELETE");
      }

      setMyManifestos((prev) => prev.filter((m) => m.id !== id));
      setPublicManifestos((prev) => prev.filter((m) => m.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete. Please try again.");
    }
  };

  const clearAllManifestos = async () => {
    try {
      if (supabaseConfigured) {
        const userId = localStorage.getItem("userId");
        await supabaseRequest(`manifestos?user_id=eq.${userId}`, "DELETE");
        await loadData();
      } else {
        setPublicManifestos((prev) =>
          prev.filter((m) => m.user_id !== "local")
        );
        localStorage.removeItem("myManifestos");
        localStorage.setItem(
          "publicManifestos",
          JSON.stringify(publicManifestos.filter((m) => m.user_id !== "local"))
        );
      }

      setMyManifestos([]);
      setShowClearAll(false);
    } catch (error) {
      console.error("Error clearing:", error);
      alert("Failed to clear. Please try again.");
    }
  };

  // 🌈 Updated Download Function with Visual Variety
  const downloadCard = async (manifestoData) => {
    setSelectedCard(manifestoData);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1200;
    const ctx = canvas.getContext("2d");

    // Gradient themes
    const themes = [
      { background: ["#0a0a0a", "#1a1a1a"], textColor: "#ffffff" },
      { background: ["#ffecd2", "#fcb69f"], textColor: "#2d2d2d" },
      { background: ["#2193b0", "#6dd5ed"], textColor: "#ffffff" },
      { background: ["#fbc2eb", "#a6c1ee"], textColor: "#2d2d2d" },
      { background: ["#f6d365", "#fda085"], textColor: "#2d2d2d" },
      { background: ["#74ebd5", "#ACB6E5"], textColor: "#2d2d2d" },
      { background: ["#667db6", "#0082c8"], textColor: "#ffffff" },
    ];

    const theme = themes[Math.floor(Math.random() * themes.length)];

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 1200, 1200);
    gradient.addColorStop(0, theme.background[0]);
    gradient.addColorStop(1, theme.background[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 1200);

    // Optional light texture overlay
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < 1200; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 1200);
      ctx.moveTo(0, i);
      ctx.lineTo(1200, i);
      ctx.strokeStyle = theme.textColor;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Text styling
    ctx.fillStyle = theme.textColor;
    ctx.font = "bold 56px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("DAILY MANIFESTO", 600, 140);

    const words = manifestoData.text.split(" ");
    const lines = [];
    let currentLine = "";

    ctx.font = "38px Georgia, serif";
    words.forEach((word) => {
      const testLine = currentLine + word + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 1000 && currentLine !== "") {
        lines.push(currentLine);
        currentLine = word + " ";
      } else {
        currentLine = testLine;
      }
    });
    lines.push(currentLine);

    let y = 400;
    lines.forEach((line) => {
      ctx.fillText(line.trim(), 600, y);
      y += 55;
    });

    ctx.font = "italic 34px Georgia, serif";
    ctx.fillStyle = theme.textColor + "cc";
    ctx.fillText(`— ${manifestoData.author}`, 600, 1020);
    ctx.fillText(manifestoData.date, 600, 1080);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setSelectedCard(null);
        return;
      }

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({
          files: [new File([blob], "manifesto.png", { type: "image/png" })],
        })
      ) {
        try {
          const file = new File([blob], `manifesto-${Date.now()}.png`, {
            type: "image/png",
          });
          await navigator.share({
            files: [file],
            title: "Daily Manifesto",
            text: manifestoData.text.substring(0, 100),
          });
        } catch (error) {
          if (error.name !== "AbortError") {
            downloadBlob(blob, `manifesto-${Date.now()}.png`);
          }
        }
      } else {
        downloadBlob(blob, `manifesto-${Date.now()}.png`);
      }

      setSelectedCard(null);
    }, "image/png");
  };

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-sm text-zinc-500 font-light tracking-wide">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div
              onClick={() => window.location.reload()}
              className="cursor-pointer select-none"
            >
              <h1 className="text-2xl sm:hidden font-serif font-bold tracking-tight">
                DM
              </h1>
              <h1 className="hidden sm:block text-3xl font-serif font-bold tracking-tight">
                Daily Manifesto
              </h1>
              <p className="text-[10px] sm:text-xs text-zinc-500 mt-0.5 font-light">
                Your daily intentions
              </p>
            </div>

            <nav className="flex gap-1 sm:gap-2">
              <button
                onClick={() => setView("write")}
                className={`px-3 sm:px-5 py-2 text-xs sm:text-sm font-medium tracking-wide transition-all ${
                  view === "write"
                    ? "text-zinc-900 border-b-2 border-zinc-900"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                Write
              </button>
              <button
                onClick={() => switchView("mine")}
                className={`px-3 sm:px-5 py-2 text-xs sm:text-sm font-medium tracking-wide transition-all ${
                  view === "mine"
                    ? "text-zinc-900 border-b-2 border-zinc-900"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                Archive
              </button>
              <button
                onClick={() => switchView("gallery")}
                className={`px-3 sm:px-5 py-2 text-xs sm:text-sm font-medium tracking-wide transition-all ${
                  view === "gallery"
                    ? "text-zinc-900 border-b-2 border-zinc-900"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                Community
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="grow">
        {view === "write" && (
          <div>
            <section>
              {/* Quote of the Day */}

              {/* Desktop */}
              {dailyQuote && (
                <div className="hidden lg:block bg-zinc-50 border-b border-zinc-200 py-10 sm:py-16">
                  <div className="max-w-3xl mx-auto px-4 text-center">
                    <motion.div
                      key={dailyQuote.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8 }}
                      className="w-full flex flex-col items-center text-center"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🌞</span>
                        <span className="text-sm uppercase tracking-wide text-zinc-500">
                          Today’s Reflection
                        </span>
                      </div>
                      <p className="text-xl sm:text-2xl leading-relaxed text-zinc-800 font-serif italic mb-4">
                        “{dailyQuote.text}”
                      </p>
                      <p className="text-zinc-600 italic">
                        — {dailyQuote.author}
                      </p>
                    </motion.div>
                  </div>
                </div>
              )}

              {/* Mobile */}
              {dailyQuote && (
                <div className=" pt-10 sm:pt-8">
                  <div className="block lg:hidden max-w-3xl mx-auto px-4 text-center">
                    <motion.div
                      key={dailyQuote.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8 }}
                      className="w-full flex flex-col items-center text-center p-4 sm:p-6 rounded-2xl bg-[#fafafa] border border-neutral-200/70 mb-6"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🌞</span>
                        <span className="text-sm uppercase tracking-wide text-zinc-500">
                          Today’s Reflection
                        </span>
                      </div>
                      <p className="text-xl sm:text-2xl leading-relaxed text-zinc-800 font-serif italic mb-4">
                        “{dailyQuote.text}”
                      </p>
                      <p className="text-zinc-600 italic">
                        — {dailyQuote.author}
                      </p>
                    </motion.div>
                  </div>
                </div>
              )}
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
              <div className="max-w-2xl mx-auto">
                <div className="mb-8 sm:mb-12">
                  <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-3">
                    Write Your Manifesto
                  </h2>
                  <p className="text-zinc-600 leading-relaxed">
                    What drives you today? Express your intentions, commitments,
                    and truth. Share your voice with the world.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900 focus:ring-opacity-5 focus:outline-none transition-all text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Your Manifesto
                    </label>
                    <textarea
                      value={manifesto}
                      onChange={(e) => setManifesto(e.target.value)}
                      placeholder="Today, I choose to..."
                      rows={8}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900 focus:ring-opacity-5 focus:outline-none transition-all text-base leading-relaxed resize-none"
                    />
                    <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
                      <span>
                        {manifesto.split(" ").filter((w) => w).length} words
                      </span>
                      <span className="hidden sm:inline">
                        Press Enter to add paragraphs
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={publishManifesto}
                    disabled={loading || !manifesto.trim() || !author.trim()}
                    className="w-full bg-zinc-900 text-white py-4 rounded-lg hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-lg shadow-zinc-900/10"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Publish Manifesto
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {view === "mine" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
            <div className="flex items-center justify-between mb-8 sm:mb-12">
              <div>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-2">
                  Your Archive
                </h2>
                <p className="text-zinc-600">
                  {myManifestos.length}{" "}
                  {myManifestos.length === 1 ? "manifesto" : "manifestos"}
                </p>
              </div>
              {myManifestos.length > 0 && (
                <button
                  onClick={() => setShowClearAll(true)}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                >
                  Clear All
                </button>
              )}
            </div>

            {myManifestos.length === 0 ? (
              <motion.div
                className="text-center py-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Calendar size={28} className="text-zinc-400" />
                </motion.div>
                <h3 className="text-lg font-medium text-zinc-900 mb-2">
                  No manifestos yet
                </h3>
                <p className="text-zinc-600 mb-6">
                  Start your journey by writing your first manifesto.
                </p>
                <button
                  onClick={() => setView("write")}
                  className="px-6 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium"
                >
                  Write Your First
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myManifestos.map((m) => (
                  <div
                    key={m.id}
                    className="bg-zinc-50 rounded-xl p-6 sm:p-8 hover:shadow-lg hover:shadow-zinc-900/5 transition-all group border border-zinc-100"
                  >
                    <div className="text-xs font-medium text-zinc-500 mb-4">
                      {m.date}
                    </div>
                    <p className="text-base leading-relaxed mb-6 text-zinc-800 line-clamp-6 whitespace-pre-wrap">
                      {m.text}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
                      <div className="text-sm italic text-zinc-600">
                        — {m.author}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => downloadCard(m)}
                          className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-white rounded-lg transition-all"
                          title="Download as image"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(m.id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    {deleteConfirm === m.id && (
                      <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        onClick={() => setDeleteConfirm(null)}
                      >
                        <div
                          className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={24} className="text-red-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-center mb-2">
                            Delete Manifesto?
                          </h3>
                          <p className="text-sm text-zinc-600 text-center mb-6">
                            This action cannot be undone.
                          </p>
                          <div className="flex gap-3">
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="flex-1 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors font-medium"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => deleteManifesto(m.id)}
                              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === "gallery" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
            <div className="flex items-center justify-between mb-8 sm:mb-12">
              <div>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-2">
                  Community
                </h2>
                <p className="text-zinc-600">
                  {publicManifestos.length}{" "}
                  {publicManifestos.length === 1 ? "manifesto" : "manifestos"}{" "}
                  shared
                </p>
              </div>
              <button
                onClick={refreshCommunity}
                disabled={refreshing}
                className="p-2.5 hover:bg-zinc-100 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw
                  size={18}
                  className={`text-zinc-600 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
              </button>
            </div>

            {publicManifestos.length === 0 ? (
              <motion.div
                className="text-center py-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <motion.div
                  className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  <Eye size={28} className="text-zinc-400" />
                </motion.div>
                <h3 className="text-lg font-medium text-zinc-900 mb-2">
                  No manifestos yet
                </h3>
                <p className="text-zinc-600 mb-6">
                  Be the first to share your intentions with the world.
                </p>
                <button
                  onClick={() => setView("write")}
                  className="px-6 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium"
                >
                  Write & Share
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicManifestos.map((m) => (
                  <div
                    key={m.id}
                    className="bg-zinc-50 rounded-xl p-6 hover:shadow-lg hover:shadow-zinc-900/5 transition-all group border border-zinc-100"
                  >
                    <div className="text-xs font-medium text-zinc-500 mb-4">
                      {m.date}
                    </div>
                    <p className="text-base leading-relaxed mb-6 text-zinc-800 line-clamp-6 whitespace-pre-wrap">
                      {m.text}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
                      <div className="text-sm italic text-zinc-600 truncate">
                        — {m.author}
                      </div>
                      <button
                        onClick={() => downloadCard(m)}
                        className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-white rounded-lg transition-all opacity-100"
                        title="Download"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-zinc-500 space-y-2">
            <p>Daily Manifesto — Share your truth, inspire the world</p>
            <p className="italic text-zinc-400">
              —{" "}
              <a
                href="https://khaleelalhaji.info"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-300 hover:text-zinc-600 hover:underline"
              >
                Khaleel Alhaji
              </a>
            </p>
          </div>
        </div>
      </footer>

      {showClearAll && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowClearAll(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} className="text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">
              Clear All Manifestos?
            </h3>
            <p className="text-sm text-zinc-600 text-center mb-6">
              This will permanently delete all {myManifestos.length} of your
              manifestos. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearAll(false)}
                className="flex-1 px-4 py-3 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={clearAllManifestos}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
