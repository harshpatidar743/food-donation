"use client";

import { useEffect, useState } from "react";
import { apiDelete, apiGet } from "@/app/lib/api";
import "./style.css";

type ContactMessage = {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

type MessagesResponse = {
  success: boolean;
  data?: ContactMessage[];
  error?: string;
  message?: string;
};

type DeleteResponse = {
  success: boolean;
  data?: {
    id: string;
  };
  error?: string;
  message?: string;
};

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function DashboardMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await apiGet<MessagesResponse>("/api/messages", {
        cache: "no-store",
      });

      if (!data.success) {
        throw new Error(data.error || data.message || "Failed to fetch messages.");
      }

      setMessages(data.data || []);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to fetch messages."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchMessages();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this message from the dashboard?")) {
      return;
    }

    try {
      setDeletingId(id);

      const data = await apiDelete<DeleteResponse>(`/api/messages/${id}`);

      if (!data.success) {
        throw new Error(data.error || data.message || "Failed to delete message.");
      }

      setMessages((currentMessages) =>
        currentMessages.filter((message) => message._id !== id)
      );
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete message."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="messages-page">
      <header>
        <div className="hero-small">
          <h1>Admin Messages</h1>
          <p>Contact form submissions are saved here for the admin team.</p>
        </div>
      </header>

      <main className="messages-content">
        <section className="messages-card">
          <div className="messages-card-header">
            <div>
              <h2>Inbox</h2>
              <p>Newest contact requests appear first.</p>
            </div>

            <button
              type="button"
              className="refresh-button"
              onClick={() => void fetchMessages()}
              disabled={isLoading}
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {error ? (
            <div className="state-panel error-panel">
              <p>{error}</p>
            </div>
          ) : null}

          {isLoading ? (
            <div className="state-panel">
              <p>Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="state-panel">
              <p>No contact messages yet.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="messages-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Message</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((message) => {
                    const isDeleting = deletingId === message._id;

                    return (
                      <tr key={message._id}>
                        <td data-label="Name">{message.name}</td>
                        <td data-label="Email">
                          <a href={`mailto:${message.email}`}>{message.email}</a>
                        </td>
                        <td data-label="Message" className="message-cell">
                          {message.message}
                        </td>
                        <td data-label="Date">
                          <time dateTime={message.createdAt}>
                            {formatDate(message.createdAt)}
                          </time>
                        </td>
                        <td data-label="Action">
                          <button
                            type="button"
                            className="delete-button"
                            onClick={() => void handleDelete(message._id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* <style jsx>{`
        
      `}</style> */}
    </div>
  );
}
