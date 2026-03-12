import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import Avatar from '../components/ui/Avatar';
import Loader from '../components/ui/Loader';
import './Chat.css';

export default function Chat() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => { fetchConversations(); }, []);

  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/chat/conversations');
      setConversations(data.data.conversations);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const selectConversation = async (conv) => {
    setActiveConv(conv);
    try {
      const { data } = await api.get(`/chat/conversations/${conv._id}/messages`);
      setMessages(data.data.messages);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) { console.error(err); }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeConv) return;
    try {
      const { data } = await api.post(`/chat/conversations/${activeConv._id}/messages`, { content: newMsg });
      setMessages((prev) => [...prev, data.data.message]);
      setNewMsg('');
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) { console.error(err); }
  };

  const getOtherParticipant = (conv) => {
    return conv.participants?.find(p => p._id !== user?._id) || conv.participants?.[0];
  };

  return (
    <div className="page-content">
      <div className="container">
        <motion.div className="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Sidebar */}
          <div className="chat__sidebar">
            <h2 className="chat__sidebar-title">Messages</h2>
            {loading ? <Loader /> : conversations.length === 0 ? (
              <p className="chat__empty">No conversations yet.</p>
            ) : (
              <div className="chat__conv-list">
                {conversations.map((conv) => {
                  const other = getOtherParticipant(conv);
                  return (
                    <button
                      key={conv._id}
                      className={`chat__conv-item ${activeConv?._id === conv._id ? 'chat__conv-item--active' : ''}`}
                      onClick={() => selectConversation(conv)}
                    >
                      <Avatar src={other?.avatar} name={other?.name || ''} size="md" />
                      <div className="chat__conv-info">
                        <span className="chat__conv-name">{other?.name || 'Unknown'}</span>
                        <span className="chat__conv-preview">{conv.lastMessage?.content?.slice(0, 40) || 'No messages yet'}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className="chat__main">
            {!activeConv ? (
              <div className="chat__placeholder">
                <span style={{ fontSize: '3rem' }}>💬</span>
                <h3>Select a conversation</h3>
                <p>Choose a conversation from the left to start chatting.</p>
              </div>
            ) : (
              <>
                <div className="chat__header">
                  <Avatar src={getOtherParticipant(activeConv)?.avatar} name={getOtherParticipant(activeConv)?.name || ''} size="md" />
                  <div>
                    <h3>{getOtherParticipant(activeConv)?.name}</h3>
                    {activeConv.type !== 'direct' && <span className="chat__header-type">{activeConv.type} chat</span>}
                  </div>
                </div>

                <div className="chat__messages">
                  {messages.map((msg) => {
                    const isMine = msg.sender?._id === user?._id || msg.sender === user?._id;
                    return (
                      <div key={msg._id} className={`chat__bubble ${isMine ? 'chat__bubble--sent' : 'chat__bubble--received'}`}>
                        {!isMine && <Avatar src={msg.sender?.avatar} name={msg.sender?.name || ''} size="sm" />}
                        <div className={`chat__bubble-content ${isMine ? 'chat__bubble-content--sent' : ''}`}>
                          <p>{msg.content}</p>
                          <span className="chat__bubble-time">
                            {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <form className="chat__input-area" onSubmit={sendMessage}>
                  <input
                    type="text"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    placeholder="Type a message..."
                    className="chat__input"
                  />
                  <button type="submit" className="chat__send-btn" disabled={!newMsg.trim()}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                    </svg>
                  </button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
