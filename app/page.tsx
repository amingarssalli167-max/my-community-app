"use client";

import { useState, useEffect } from "react";
import { supabase } from "./supabase";

type Post = { id: number; section_id: string; title: string; body: string };
type Message = { id: number; section_id: string; text: string };

export default function Home() {
  const sections = [
    {
      id: "gaming",
      name: "الألعاب",
      color: "#9B6BFF",
      subsections: [
        { id: "gaming-general", name: "عام" },
        { id: "gaming-dev", name: "تطوير الألعاب" },
      ],
    },
    {
      id: "editing",
      name: "الإيديت والمونتاج",
      color: "#FF3D8A",
      subsections: [
        { id: "editing-general", name: "عام" },
        { id: "editing-filters", name: "الفلاترة" },
      ],
    },
    {
      id: "movies",
      name: "الأفلام والمسلسلات",
      color: "#FFC24B",
      subsections: [{ id: "movies-general", name: "عام" }],
    },
  ];

  const [selectedId, setSelectedId] = useState("gaming");
  const [selectedSubId, setSelectedSubId] = useState("gaming-general");
  const [tab, setTab] = useState<"chat" | "posts">("chat");

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostBody, setNewPostBody] = useState("");

  const selectedSection = sections.find((s) => s.id === selectedId);

  useEffect(() => {
    fetchPosts();
    fetchMessages();
  }, []);

  async function fetchPosts() {
    const { data, error } = await supabase.from("posts").select("*").order("id", { ascending: false });
    if (error) {
      console.error(error);
      return;
    }
    setPosts(data || []);
  }

  async function fetchMessages() {
    const { data, error } = await supabase.from("messages").select("*").order("id", { ascending: true });
    if (error) {
      console.error(error);
      return;
    }
    setMessages(data || []);
  }

  function selectSection(id: string) {
    setSelectedId(id);
    const section = sections.find((s) => s.id === id);
    if (section) {
      setSelectedSubId(section.subsections[0].id);
    }
  }

  async function sendMessage() {
    if (newMessage.trim() === "") return;
    const { error } = await supabase.from("messages").insert({ section_id: selectedSubId, text: newMessage });
    if (error) {
      console.error(error);
      return;
    }
    setNewMessage("");
    fetchMessages();
  }

  async function addPost() {
    if (newPostTitle.trim() === "") return;
    const { error } = await supabase
      .from("posts")
      .insert({ section_id: selectedSubId, title: newPostTitle, body: newPostBody });
    if (error) {
      console.error(error);
      return;
    }
    setNewPostTitle("");
    setNewPostBody("");
    fetchPosts();
  }

  const postsForSection = posts.filter((p) => p.section_id === selectedSubId);
  const messagesForSection = messages.filter((m) => m.section_id === selectedSubId);

  return (
    <main style={{ background: "#100F17", minHeight: "100vh", padding: "40px", direction: "rtl" }}>
      <h1 style={{ color: "white", fontSize: "28px", marginBottom: "24px" }}>
        الأقسام الرئيسية
      </h1>

      <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
        {sections.map((s) => (
          <div
            key={s.id}
            onClick={() => selectSection(s.id)}
            style={{
              background: selectedId === s.id ? s.color : "#1A1826",
              border: `2px solid ${s.color}`,
              borderRadius: "12px",
              padding: "20px",
              color: selectedId === s.id ? "#0A0910" : "white",
              width: "200px",
              cursor: "pointer",
            }}
          >
            {s.name}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {selectedSection?.subsections.map((sub) => (
          <div
            key={sub.id}
            onClick={() => setSelectedSubId(sub.id)}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              cursor: "pointer",
              background: selectedSubId === sub.id ? "#221F32" : "#1A1826",
              color: selectedSubId === sub.id ? "white" : "#9C97B8",
              border: selectedSubId === sub.id ? "1px solid #9B6BFF" : "1px solid transparent",
            }}
          >
            {sub.name}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        <button
          onClick={() => setTab("chat")}
          style={{ padding: "8px 20px", borderRadius: "8px", border: "none", background: tab === "chat" ? "#9B6BFF" : "#1A1826", color: tab === "chat" ? "#0A0910" : "#9C97B8", cursor: "pointer" }}
        >
          الشات
        </button>
        <button
          onClick={() => setTab("posts")}
          style={{ padding: "8px 20px", borderRadius: "8px", border: "none", background: tab === "posts" ? "#9B6BFF" : "#1A1826", color: tab === "posts" ? "#0A0910" : "#9C97B8", cursor: "pointer" }}
        >
          المنشورات
        </button>
      </div>

      {tab === "chat" && (
        <div>
          <div style={{ background: "#1A1826", borderRadius: "12px", padding: "16px", maxWidth: "400px", marginBottom: "12px" }}>
            {messagesForSection.length === 0 && <div style={{ color: "#635E80" }}>ما فيه رسائل بعد</div>}
            {messagesForSection.map((msg) => (
              <div key={msg.id} style={{ color: "#EDEAF6", padding: "6px 0" }}>{msg.text}</div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "8px", maxWidth: "400px" }}>
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="اكتب رسالة..."
              style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #2E2A42", background: "#1A1826", color: "white" }}
            />
            <button onClick={sendMessage} style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: "#9B6BFF", color: "#0A0910", cursor: "pointer" }}>
              إرسال
            </button>
          </div>
        </div>
      )}

      {tab === "posts" && (
        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "500px", marginBottom: "20px" }}>
            {postsForSection.length === 0 && <div style={{ color: "#635E80" }}>ما فيه منشورات بعد</div>}
            {postsForSection.map((post) => (
              <div key={post.id} style={{ background: "#1A1826", border: "1px solid #2E2A42", borderRadius: "12px", padding: "16px" }}>
                <div style={{ color: "white", fontWeight: "bold", marginBottom: "6px" }}>{post.title}</div>
                <div style={{ color: "#9C97B8", fontSize: "14px" }}>{post.body}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "500px" }}>
            <input
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              placeholder="عنوان المنشور..."
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #2E2A42", background: "#1A1826", color: "white" }}
            />
            <textarea
              value={newPostBody}
              onChange={(e) => setNewPostBody(e.target.value)}
              placeholder="محتوى المنشور..."
              rows={3}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #2E2A42", background: "#1A1826", color: "white", fontFamily: "inherit" }}
            />
            <button onClick={addPost} style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: "#9B6BFF", color: "#0A0910", cursor: "pointer", alignSelf: "flex-start" }}>
              نشر
            </button>
          </div>
        </div>
      )}
    </main>
  );
}