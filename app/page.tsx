"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";

type Post = { id: number; section_id: string; title: string; body: string; video_url: string | null; user_id: string | null; is_premium: boolean };
type Message = { id: number; section_id: string; text: string; video_url: string | null; user_id: string | null };
type Video = { id: number; section_id: string; title: string; url: string; user_id: string | null };
type Profile = { id: string; username: string; bio: string | null; avatar_url: string | null; is_premium: boolean; language: string | null };
type PostLike = { id: number; post_id: number; user_id: string };
type VideoLike = { id: number; video_id: number; user_id: string };
type PostComment = { id: number; post_id: number; user_id: string; text: string };
type VideoComment = { id: number; video_id: number; user_id: string; text: string };
type MessageReaction = { id: number; message_id: number; user_id: string; emoji: string };
type DirectMessage = { id: number; sender_id: string; recipient_id: string; text: string; created_at: string };
type Community = {
  id: number; name: string; description: string | null; section_id: string;
  owner_id: string; color: string; is_private: boolean; created_at: string;
  game_name?: string; game_platform?: string; game_type?: string;
  edit_type?: string; edit_software?: string; edit_level?: string;
  movies_genre?: string; movies_source?: string; movies_language?: string;
  sport_type?: string; sport_team?: string; sport_content?: string;
};
type CommunityMember = { id: number; community_id: number; user_id: string; status: string; created_at: string };
type Notification = {
  id: number; user_id: string; from_user_id: string | null;
  type: string; message: string; is_read: boolean;
  related_id: number | null; created_at: string;
};
type Lang = "ar" | "en" | "fr";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

const translations = {
  ar: {
    loading: "جاري التحميل...",
    login_title: "تسجيل الدخول",
    username_signup_placeholder: "اسم المستخدم (لإنشاء حساب جديد)",
    email_placeholder: "البريد الإلكتروني",
    password_placeholder: "كلمة السر",
    login_button: "دخول",
    signup_button: "حساب جديد",
    enter_username_error: "دخل اسم مستخدم",
    username_taken_error: "الاسم مستخدم من قبل، جرب اسم آخر",
    choose_username_title: "اختار اسم مستخدم",
    choose_username_desc: "باش يبان بدل الإيميل في الشات والمنشورات",
    save: "حفظ",
    main_sections: "الأقسام الرئيسية",
    logout: "تسجيل خروج",
    tab_chat: "الشات",
    tab_posts: "المنشورات",
    tab_videos: "الفيديوهات",
    tab_communities: "المجتمعات",
    no_messages: "ما فيه رسائل بعد",
    type_message_placeholder: "اكتب رسالة...",
    send: "إرسال",
    video_attached_prefix: "فيديو مرفق: ",
    no_posts: "ما فيه منشورات بعد",
    post_title_placeholder: "عنوان المنشور...",
    post_body_placeholder: "محتوى المنشور...",
    publish: "نشر",
    publishing: "جاري النشر...",
    no_videos: "ما فيه فيديوهات بعد",
    video_title_placeholder: "عنوان الفيديو...",
    upload_video: "رفع الفيديو",
    uploading_video: "جاري الرفع...",
    write_comment_placeholder: "اكتب تعليق...",
    comment_button: "تعليق",
    private_messages_title: "الرسائل الخاصة",
    no_dm_yet: "ما عندكش رسائل خاصة بعد.",
    back_to_messages: "رجوع",
    start_conversation: "ابدا المحادثة...",
    back_to_my_profile: "← رجوع لبروفايلي",
    tap_photo_to_change: "دوس على الصورة باش تبدلها",
    stat_posts: "منشورات",
    stat_videos: "فيديوهات",
    stat_messages: "رسائل",
    no_bio: "بلا نبذة",
    edit_profile_button: "تعديل البروفايل",
    username_label: "اسم المستخدم",
    bio_label: "نبذة عني",
    bio_placeholder: "اكتب نبذة قصيرة عن نفسك...",
    cancel: "إلغاء",
    saving: "جاري الحفظ...",
    back: "← رجوع",
    change_password_title: "تغيير كلمة السر",
    new_password_placeholder: "كلمة سر جديدة",
    password_too_short: "كلمة السر لازم تكون 6 حروف على الأقل",
    password_changed_success: "تبدلت كلمة السر بنجاح ✓",
    save_password_button: "حفظ كلمة السر",
    change_email_title: "تغيير البريد الإلكتروني",
    new_email_placeholder: "بريد إلكتروني جديد",
    email_change_confirm_msg: "تفقد بريدك الإلكتروني لتأكيد التغيير ✓",
    save_email_button: "حفظ البريد الجديد",
    delete_account_title: "حذف الحساب",
    delete_account_warning: "هذا يمسح بروفايلك وكل منشوراتك وفيديوهاتك ورسائلك وتعليقاتك نهائيًا.",
    delete_confirm_warning: "متأكد؟ هذا الإجراء ما يمكن التراجع فيه.",
    delete_confirm_button: "نعم، احذف حسابي نهائيًا",
    deleting: "جاري الحذف...",
    send_message_button: "إرسال رسالة",
    language_label: "اللغة",
    section_gaming: "الألعاب",
    section_editing: "الإيديت والمونتاج",
    section_movies: "الأفلام والمسلسلات",
    section_sports: "الرياضة",
    subsection_general: "عام",
    premium_settings_title: "💎 Premium (نسخة تجريبية)",
    premium_settings_desc: "هذا زر تفعيل يدوي بس للتجربة.",
    activate_premium_button: "تفعيل Premium (تجريبي)",
    deactivate_premium_button: "إلغاء Premium (تجريبي)",
    premium_only_checkbox_label: "💎 لأعضاء Premium بس",
    premium_content_title: "محتوى Premium",
    premium_content_desc: "هذا المنشور متاح لأعضاء Premium بس",
    unlock_premium_button: "افتح Premium",
    search_placeholder: "ابحث عن محادثة...",
    messages_empty_search: "ما لقيت نتائج",
    communities_title: "المجتمعات",
    create_community: "إنشاء مجتمع",
    community_name: "اسم المجتمع",
    community_desc: "وصف المجتمع",
    community_color: "لون المجتمع",
    community_private: "مجتمع خاص (يحتاج موافقة)",
    creating: "جاري الإنشاء...",
    no_communities: "ما فيه مجتمعات بعد، كن أول من يضيف!",
    join_request_sent: "تم إرسال طلب الانضمام ✓",
    already_member: "أنت عضو ✓",
    pending_approval: "في انتظار الموافقة...",
    join_community: "انضمام للمجتمع",
    members_count: "عضو",
    owner_label: "المؤسس",
    manage_requests: "إدارة الطلبات",
    approve: "قبول",
    reject: "رفض",
    no_pending: "ما فيه طلبات معلقة",
    premium_required: "💎 يحتاج Premium لإنشاء مجتمع",
    back_to_communities: "← رجوع للمجتمعات",
    enter_community: "دخول",
    community_members: "الأعضاء",
    game_name_label: "اسم اللعبة",
    game_platform_label: "المنصة",
    game_type_label: "نوع المجتمع",
    edit_type_label: "نوع الإيديت",
    edit_software_label: "البرنامج",
    edit_level_label: "المستوى",
    movies_genre_label: "النوع",
    movies_source_label: "المصدر",
    movies_language_label: "اللغة",
    sport_type_label: "الرياضة",
    sport_team_label: "الفريق",
    sport_content_label: "نوع المحتوى",
    // إشعارات
    notifications_title: "الإشعارات",
    no_notifications: "ما فيه إشعارات بعد",
    mark_all_read: "تعيين الكل كمقروء",
    notif_like_post: "أعجبه منشورك",
    notif_like_video: "أعجبه فيديوك",
    notif_comment_post: "علّق على منشورك",
    notif_comment_video: "علّق على فيديوك",
    notif_dm: "أرسل لك رسالة خاصة",
    notif_join_request: "طلب الانضمام لمجتمعك",
    notif_join_approved: "تمت الموافقة على طلبك ✓",
    notif_join_rejected: "تم رفض طلبك",
    just_now: "الآن",
    minutes_ago: "د",
    hours_ago: "س",
    days_ago: "ي",
  },
  en: {
    loading: "Loading...",
    login_title: "Login",
    username_signup_placeholder: "Username (for new account)",
    email_placeholder: "Email",
    password_placeholder: "Password",
    login_button: "Log In",
    signup_button: "Sign Up",
    enter_username_error: "Enter a username",
    username_taken_error: "This username is taken, try another",
    choose_username_title: "Choose a username",
    choose_username_desc: "It will show instead of your email",
    save: "Save",
    main_sections: "Main Sections",
    logout: "Log Out",
    tab_chat: "Chat",
    tab_posts: "Posts",
    tab_videos: "Videos",
    tab_communities: "Communities",
    no_messages: "No messages yet",
    type_message_placeholder: "Type a message...",
    send: "Send",
    video_attached_prefix: "Video attached: ",
    no_posts: "No posts yet",
    post_title_placeholder: "Post title...",
    post_body_placeholder: "Post content...",
    publish: "Post",
    publishing: "Posting...",
    no_videos: "No videos yet",
    video_title_placeholder: "Video title...",
    upload_video: "Upload Video",
    uploading_video: "Uploading...",
    write_comment_placeholder: "Write a comment...",
    comment_button: "Comment",
    private_messages_title: "Messages",
    no_dm_yet: "No private messages yet.",
    back_to_messages: "Back",
    start_conversation: "Start the conversation...",
    back_to_my_profile: "← Back to my profile",
    tap_photo_to_change: "Tap the photo to change it",
    stat_posts: "Posts",
    stat_videos: "Videos",
    stat_messages: "Messages",
    no_bio: "No bio",
    edit_profile_button: "Edit Profile",
    username_label: "Username",
    bio_label: "Bio",
    bio_placeholder: "Write a short bio...",
    cancel: "Cancel",
    saving: "Saving...",
    back: "← Back",
    change_password_title: "Change Password",
    new_password_placeholder: "New password",
    password_too_short: "Password must be at least 6 characters",
    password_changed_success: "Password changed successfully ✓",
    save_password_button: "Save Password",
    change_email_title: "Change Email",
    new_email_placeholder: "New email",
    email_change_confirm_msg: "Check your email to confirm ✓",
    save_email_button: "Save New Email",
    delete_account_title: "Delete Account",
    delete_account_warning: "This will permanently delete your profile and all content.",
    delete_confirm_warning: "Are you sure? This cannot be undone.",
    delete_confirm_button: "Yes, delete my account",
    deleting: "Deleting...",
    send_message_button: "Send Message",
    language_label: "Language",
    section_gaming: "Gaming",
    section_editing: "Editing",
    section_movies: "Movies & Series",
    section_sports: "Sports",
    subsection_general: "General",
    premium_settings_title: "💎 Premium (test)",
    premium_settings_desc: "Manual test toggle — no real payment yet.",
    activate_premium_button: "Activate Premium (test)",
    deactivate_premium_button: "Deactivate Premium (test)",
    premium_only_checkbox_label: "💎 Premium only",
    premium_content_title: "Premium Content",
    premium_content_desc: "Available to Premium members only",
    unlock_premium_button: "Unlock Premium",
    search_placeholder: "Search conversations...",
    messages_empty_search: "No results",
    communities_title: "Communities",
    create_community: "Create Community",
    community_name: "Community Name",
    community_desc: "Description",
    community_color: "Color",
    community_private: "Private (requires approval)",
    creating: "Creating...",
    no_communities: "No communities yet, be the first!",
    join_request_sent: "Request sent ✓",
    already_member: "You're a member ✓",
    pending_approval: "Pending approval...",
    join_community: "Join",
    members_count: "members",
    owner_label: "Founder",
    manage_requests: "Manage Requests",
    approve: "Approve",
    reject: "Reject",
    no_pending: "No pending requests",
    premium_required: "💎 Premium required",
    back_to_communities: "← Back",
    enter_community: "Enter",
    community_members: "Members",
    game_name_label: "Game",
    game_platform_label: "Platform",
    game_type_label: "Type",
    edit_type_label: "Edit Type",
    edit_software_label: "Software",
    edit_level_label: "Level",
    movies_genre_label: "Genre",
    movies_source_label: "Source",
    movies_language_label: "Language",
    sport_type_label: "Sport",
    sport_team_label: "Team",
    sport_content_label: "Content Type",
    notifications_title: "Notifications",
    no_notifications: "No notifications yet",
    mark_all_read: "Mark all as read",
    notif_like_post: "liked your post",
    notif_like_video: "liked your video",
    notif_comment_post: "commented on your post",
    notif_comment_video: "commented on your video",
    notif_dm: "sent you a message",
    notif_join_request: "requested to join your community",
    notif_join_approved: "Your join request was approved ✓",
    notif_join_rejected: "Your join request was rejected",
    just_now: "now",
    minutes_ago: "m",
    hours_ago: "h",
    days_ago: "d",
  },
  fr: {
    loading: "Chargement...",
    login_title: "Connexion",
    username_signup_placeholder: "Nom d'utilisateur (nouveau compte)",
    email_placeholder: "E-mail",
    password_placeholder: "Mot de passe",
    login_button: "Connexion",
    signup_button: "Créer un compte",
    enter_username_error: "Entrez un nom d'utilisateur",
    username_taken_error: "Ce nom est déjà pris",
    choose_username_title: "Choisissez un nom d'utilisateur",
    choose_username_desc: "Il apparaîtra dans le chat et les publications",
    save: "Enregistrer",
    main_sections: "Sections principales",
    logout: "Déconnexion",
    tab_chat: "Chat",
    tab_posts: "Publications",
    tab_videos: "Vidéos",
    tab_communities: "Communautés",
    no_messages: "Aucun message",
    type_message_placeholder: "Écrivez un message...",
    send: "Envoyer",
    video_attached_prefix: "Vidéo jointe : ",
    no_posts: "Aucune publication",
    post_title_placeholder: "Titre...",
    post_body_placeholder: "Contenu...",
    publish: "Publier",
    publishing: "Publication...",
    no_videos: "Aucune vidéo",
    video_title_placeholder: "Titre de la vidéo...",
    upload_video: "Téléverser",
    uploading_video: "Téléversement...",
    write_comment_placeholder: "Commenter...",
    comment_button: "Commenter",
    private_messages_title: "Messages",
    no_dm_yet: "Pas encore de messages privés.",
    back_to_messages: "Retour",
    start_conversation: "Commencez la conversation...",
    back_to_my_profile: "← Retour",
    tap_photo_to_change: "Appuyez pour changer",
    stat_posts: "Publications",
    stat_videos: "Vidéos",
    stat_messages: "Messages",
    no_bio: "Aucune bio",
    edit_profile_button: "Modifier",
    username_label: "Nom d'utilisateur",
    bio_label: "Bio",
    bio_placeholder: "Courte bio...",
    cancel: "Annuler",
    saving: "Enregistrement...",
    back: "← Retour",
    change_password_title: "Mot de passe",
    new_password_placeholder: "Nouveau mot de passe",
    password_too_short: "Au moins 6 caractères",
    password_changed_success: "Mot de passe changé ✓",
    save_password_button: "Enregistrer",
    change_email_title: "E-mail",
    new_email_placeholder: "Nouvel e-mail",
    email_change_confirm_msg: "Vérifiez votre e-mail ✓",
    save_email_button: "Enregistrer",
    delete_account_title: "Supprimer le compte",
    delete_account_warning: "Suppression définitive de tout votre contenu.",
    delete_confirm_warning: "Êtes-vous sûr ?",
    delete_confirm_button: "Oui, supprimer",
    deleting: "Suppression...",
    send_message_button: "Envoyer un message",
    language_label: "Langue",
    section_gaming: "Jeux",
    section_editing: "Montage",
    section_movies: "Films",
    section_sports: "Sport",
    subsection_general: "Général",
    premium_settings_title: "💎 Premium (test)",
    premium_settings_desc: "Bouton de test.",
    activate_premium_button: "Activer Premium",
    deactivate_premium_button: "Désactiver Premium",
    premium_only_checkbox_label: "💎 Premium uniquement",
    premium_content_title: "Contenu Premium",
    premium_content_desc: "Réservé aux membres Premium",
    unlock_premium_button: "Débloquer",
    search_placeholder: "Rechercher...",
    messages_empty_search: "Aucun résultat",
    communities_title: "Communautés",
    create_community: "Créer",
    community_name: "Nom",
    community_desc: "Description",
    community_color: "Couleur",
    community_private: "Privée",
    creating: "Création...",
    no_communities: "Aucune communauté",
    join_request_sent: "Demande envoyée ✓",
    already_member: "Membre ✓",
    pending_approval: "En attente...",
    join_community: "Rejoindre",
    members_count: "membres",
    owner_label: "Fondateur",
    manage_requests: "Gérer",
    approve: "Approuver",
    reject: "Rejeter",
    no_pending: "Aucune demande",
    premium_required: "💎 Premium requis",
    back_to_communities: "← Retour",
    enter_community: "Entrer",
    community_members: "Membres",
    game_name_label: "Jeu",
    game_platform_label: "Plateforme",
    game_type_label: "Type",
    edit_type_label: "Type",
    edit_software_label: "Logiciel",
    edit_level_label: "Niveau",
    movies_genre_label: "Genre",
    movies_source_label: "Source",
    movies_language_label: "Langue",
    sport_type_label: "Sport",
    sport_team_label: "Équipe",
    sport_content_label: "Contenu",
    notifications_title: "Notifications",
    no_notifications: "Aucune notification",
    mark_all_read: "Tout marquer comme lu",
    notif_like_post: "a aimé votre publication",
    notif_like_video: "a aimé votre vidéo",
    notif_comment_post: "a commenté votre publication",
    notif_comment_video: "a commenté votre vidéo",
    notif_dm: "vous a envoyé un message",
    notif_join_request: "demande à rejoindre votre communauté",
    notif_join_approved: "Votre demande a été approuvée ✓",
    notif_join_rejected: "Votre demande a été rejetée",
    just_now: "maintenant",
    minutes_ago: "min",
    hours_ago: "h",
    days_ago: "j",
  },
} as const;

function Avatar({ name, avatarUrl, size = 32, onClick }: { name: string; avatarUrl?: string | null; size?: number; onClick?: () => void }) {
  if (avatarUrl) return <img src={avatarUrl} onClick={onClick} style={{ width: size, height: size, minWidth: size, borderRadius: "50%", objectFit: "cover", cursor: onClick ? "pointer" : "default", flexShrink: 0 }} />;
  return <div onClick={onClick} style={{ width: size, height: size, minWidth: size, borderRadius: "50%", background: "linear-gradient(135deg, #9B6BFF, #FF3D8A)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: Math.round(size * 0.45), cursor: onClick ? "pointer" : "default", flexShrink: 0 }}>{name.charAt(0).toUpperCase()}</div>;
}

// ===== مكون الإشعار المنبثق =====
function ToastNotification({ notif, onClose }: { notif: Notification & { fromUsername: string; fromAvatar: string | null }; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, []);

  const icons: Record<string, string> = {
    like_post: "❤️", like_video: "❤️", comment_post: "💬", comment_video: "💬",
    dm: "✉️", join_request: "👥", join_approved: "✅", join_rejected: "❌",
  };

  return (
    <div style={{
      position: "fixed", top: "20px", right: "20px", zIndex: 9999,
      background: "#1A1826", border: "1px solid #2E2A42", borderRadius: "14px",
      padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)", minWidth: "280px", maxWidth: "340px",
      animation: "slideIn 0.3s ease",
    }}>
      <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
      <div style={{ fontSize: "24px" }}>{icons[notif.type] || "🔔"}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: "white", fontSize: "13px", fontWeight: "bold", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {notif.fromUsername}
        </div>
        <div style={{ color: "#9C97B8", fontSize: "12px" }}>{notif.message}</div>
      </div>
      <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#635E80", cursor: "pointer", fontSize: "16px", flexShrink: 0 }}>✕</button>
    </div>
  );
}

export default function Home() {
  const [language, setLanguage] = useState<Lang>("ar");
  const dir = language === "ar" ? "rtl" : "ltr";

  function t(key: keyof typeof translations["ar"]): string {
    return translations[language][key] || translations.ar[key] || key;
  }

  const sections = [
    { id: "gaming", name: t("section_gaming"), color: "#9B6BFF", subsections: [{ id: "gaming-general", name: t("subsection_general") }] },
    { id: "editing", name: t("section_editing"), color: "#FF3D8A", subsections: [{ id: "editing-general", name: t("subsection_general") }] },
    { id: "movies", name: t("section_movies"), color: "#FFC24B", subsections: [{ id: "movies-general", name: t("subsection_general") }] },
    { id: "sports", name: t("section_sports"), color: "#22D3EE", subsections: [{ id: "sports-general", name: t("subsection_general") }] },
  ];

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [username, setUsername] = useState(""); const [authError, setAuthError] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]); const [profilesLoaded, setProfilesLoaded] = useState(false);
  const [completeUsername, setCompleteUsername] = useState(""); const [completeError, setCompleteError] = useState(""); const [savingUsername, setSavingUsername] = useState(false);
  const [selectedId, setSelectedId] = useState("gaming"); const [selectedSubId, setSelectedSubId] = useState("gaming-general");
  const [tab, setTab] = useState<"chat" | "posts" | "videos" | "profile" | "communities">("chat");
  const [messages, setMessages] = useState<Message[]>([]); const [newMessage, setNewMessage] = useState(""); const [newMessageVideo, setNewMessageVideo] = useState<File | null>(null); const [sendingMessage, setSendingMessage] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]); const [newPostTitle, setNewPostTitle] = useState(""); const [newPostBody, setNewPostBody] = useState(""); const [newPostVideo, setNewPostVideo] = useState<File | null>(null); const [newPostIsPremium, setNewPostIsPremium] = useState(false); const [publishingPost, setPublishingPost] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]); const [newVideoTitle, setNewVideoTitle] = useState(""); const [videoFile, setVideoFile] = useState<File | null>(null); const [uploading, setUploading] = useState(false);
  const [postLikes, setPostLikes] = useState<PostLike[]>([]); const [videoLikes, setVideoLikes] = useState<VideoLike[]>([]);
  const [postComments, setPostComments] = useState<PostComment[]>([]); const [videoComments, setVideoComments] = useState<VideoComment[]>([]);
  const [newPostCommentText, setNewPostCommentText] = useState<Record<number, string>>({}); const [newVideoCommentText, setNewVideoCommentText] = useState<Record<number, string>>({});
  const [messageReactions, setMessageReactions] = useState<MessageReaction[]>([]);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null); const [editingProfile, setEditingProfile] = useState(false); const [profileUsernameDraft, setProfileUsernameDraft] = useState(""); const [profileBioDraft, setProfileBioDraft] = useState(""); const [savingProfile, setSavingProfile] = useState(false); const [profileSaveError, setProfileSaveError] = useState(""); const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showSettings, setShowSettings] = useState(false); const [newPasswordDraft, setNewPasswordDraft] = useState(""); const [passwordChangeMsg, setPasswordChangeMsg] = useState(""); const [changingPassword, setChangingPassword] = useState(false); const [newEmailDraft, setNewEmailDraft] = useState(""); const [emailChangeMsg, setEmailChangeMsg] = useState(""); const [changingEmail, setChangingEmail] = useState(false); const [confirmingDelete, setConfirmingDelete] = useState(false); const [deletingAccount, setDeletingAccount] = useState(false);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]); const [activeDmUserId, setActiveDmUserId] = useState<string | null>(null); const [newDmText, setNewDmText] = useState(""); const [sendingDm, setSendingDm] = useState(false);
  const [dmPanelOpen, setDmPanelOpen] = useState(false); const [dmSearch, setDmSearch] = useState("");
  const dmMessagesEndRef = useRef<HTMLDivElement>(null);
  const [communities, setCommunities] = useState<Community[]>([]); const [communityMembers, setCommunityMembers] = useState<CommunityMember[]>([]); const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null); const [showCreateCommunity, setShowCreateCommunity] = useState(false); const [showManageRequests, setShowManageRequests] = useState(false); const [creatingCommunity, setCreatingCommunity] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState(""); const [newCommunityDesc, setNewCommunityDesc] = useState(""); const [newCommunityColor, setNewCommunityColor] = useState("#9B6BFF"); const [newCommunityPrivate, setNewCommunityPrivate] = useState(true);
  const [newGameName, setNewGameName] = useState(""); const [newGamePlatform, setNewGamePlatform] = useState(""); const [newGameType, setNewGameType] = useState("");
  const [newEditType, setNewEditType] = useState(""); const [newEditSoftware, setNewEditSoftware] = useState(""); const [newEditLevel, setNewEditLevel] = useState("");
  const [newMoviesGenre, setNewMoviesGenre] = useState(""); const [newMoviesSource, setNewMoviesSource] = useState(""); const [newMoviesLanguage, setNewMoviesLanguage] = useState("");
  const [newSportType, setNewSportType] = useState(""); const [newSportTeam, setNewSportTeam] = useState(""); const [newSportContent, setNewSportContent] = useState("");

  // ===== حالات الإشعارات =====
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toastNotif, setToastNotif] = useState<(Notification & { fromUsername: string; fromAvatar: string | null }) | null>(null);
  const notifPanelRef = useRef<HTMLDivElement>(null);

  const selectedSection = sections.find((s) => s.id === selectedId);
  const unreadDmCount = user ? directMessages.filter((m) => m.recipient_id === user.id).length : 0;
  const unreadNotifCount = notifications.filter((n) => !n.is_read).length;

  // ===== دالة وقت نسبي =====
  function timeAgo(dateStr: string): string {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return t("just_now");
    if (diff < 3600) return `${Math.floor(diff / 60)}${t("minutes_ago")}`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}${t("hours_ago")}`;
    return `${Math.floor(diff / 86400)}${t("days_ago")}`;
  }

  // ===== إنشاء إشعار =====
  async function createNotification(userId: string, fromUserId: string, type: string, message: string, relatedId?: number) {
    if (userId === fromUserId) return; // ما نرسلش إشعار لنفسك
    await supabase.from("notifications").insert({ user_id: userId, from_user_id: fromUserId, type, message, related_id: relatedId || null });
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { setUser(data.user); setAuthLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => { setUser(session?.user ?? null); });
    return () => { listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (user) {
      fetchPosts(); fetchMessages(); fetchVideos(); fetchProfiles();
      fetchPostLikes(); fetchVideoLikes(); fetchPostComments(); fetchVideoComments();
      fetchMessageReactions(); fetchDirectMessages();
      fetchCommunities(); fetchCommunityMembers();
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (user && profiles.length > 0) {
      const mine = profiles.find((p) => p.id === user.id);
      if (mine?.language === "ar" || mine?.language === "en" || mine?.language === "fr") setLanguage(mine.language);
    }
  }, [profiles, user]);

  // اشتراك الرسائل الفوري
  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel("messages-rt").on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
      const m = payload.new as Message;
      setMessages((prev) => prev.some((x) => x.id === m.id) ? prev : [...prev, m]);
    }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  // اشتراك DM الفوري
  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel("dm-rt").on("postgres_changes", { event: "INSERT", schema: "public", table: "direct_messages" }, (payload) => {
      const m = payload.new as DirectMessage;
      setDirectMessages((prev) => prev.some((x) => x.id === m.id) ? prev : [...prev, m]);
    }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  // ===== اشتراك الإشعارات الفوري =====
  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel("notif-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const n = payload.new as Notification;
          setNotifications((prev) => prev.some((x) => x.id === n.id) ? prev : [n, ...prev]);
          // إظهار popup
          const fromUsername = profiles.find((p) => p.id === n.from_user_id)?.username || "?";
          const fromAvatar = profiles.find((p) => p.id === n.from_user_id)?.avatar_url || null;
          setToastNotif({ ...n, fromUsername, fromAvatar });
        }
      ).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, profiles]);

  useEffect(() => {
    if (dmMessagesEndRef.current) dmMessagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [activeDmUserId, directMessages]);

  // إغلاق قائمة الإشعارات عند الضغط خارجها
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifPanelRef.current && !notifPanelRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showNotifications]);

  async function fetchNotifications() {
    const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50);
    setNotifications(data || []);
  }

  async function markAllRead() {
    if (!user) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  async function markOneRead(id: number) {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  }

  async function fetchPosts() { const { data } = await supabase.from("posts").select("*").order("id", { ascending: false }); setPosts(data || []); }
  async function fetchMessages() { const { data } = await supabase.from("messages").select("*").order("id", { ascending: true }); setMessages(data || []); }
  async function fetchVideos() { const { data } = await supabase.from("videos").select("*").order("id", { ascending: false }); setVideos(data || []); }
  async function fetchProfiles() { const { data } = await supabase.from("profiles").select("*"); setProfiles(data || []); setProfilesLoaded(true); }
  async function fetchPostLikes() { const { data } = await supabase.from("post_likes").select("*"); setPostLikes(data || []); }
  async function fetchVideoLikes() { const { data } = await supabase.from("video_likes").select("*"); setVideoLikes(data || []); }
  async function fetchPostComments() { const { data } = await supabase.from("post_comments").select("*").order("id", { ascending: true }); setPostComments(data || []); }
  async function fetchVideoComments() { const { data } = await supabase.from("video_comments").select("*").order("id", { ascending: true }); setVideoComments(data || []); }
  async function fetchMessageReactions() { const { data } = await supabase.from("message_reactions").select("*"); setMessageReactions(data || []); }
  async function fetchDirectMessages() { const { data } = await supabase.from("direct_messages").select("*").order("id", { ascending: true }); setDirectMessages(data || []); }
  async function fetchCommunities() { const { data } = await supabase.from("communities").select("*").order("created_at", { ascending: false }); setCommunities(data || []); }
  async function fetchCommunityMembers() { const { data } = await supabase.from("community_members").select("*"); setCommunityMembers(data || []); }

  function usernameFor(id: string | null | undefined) { return profiles.find((p) => p.id === id)?.username || "?"; }
  function avatarUrlFor(id: string | null | undefined) { return profiles.find((p) => p.id === id)?.avatar_url || null; }
  function isPremiumUser(id: string | null | undefined) { return !!profiles.find((p) => p.id === id)?.is_premium; }
  function myMembershipStatus(communityId: number) { if (!user) return null; return communityMembers.find((m) => m.community_id === communityId && m.user_id === user.id)?.status || null; }
  function communityMembersCount(communityId: number) { return communityMembers.filter((m) => m.community_id === communityId && m.status === "approved").length; }
  function pendingRequests(communityId: number) { return communityMembers.filter((m) => m.community_id === communityId && m.status === "pending"); }

  function viewProfile(id: string | null | undefined) {
    if (!id || !user) return;
    setEditingProfile(false); setShowSettings(false); setConfirmingDelete(false);
    if (id === user.id) { const mine = profiles.find((p) => p.id === user.id); setViewingProfileId(null); setProfileUsernameDraft(mine?.username || ""); setProfileBioDraft(mine?.bio || ""); }
    else setViewingProfileId(id);
    setTab("profile");
  }

  async function updateMyProfile(): Promise<boolean> {
    if (!user || profileUsernameDraft.trim() === "") return false;
    setSavingProfile(true); setProfileSaveError("");
    const { error } = await supabase.from("profiles").update({ username: profileUsernameDraft.trim(), bio: profileBioDraft.trim() || null }).eq("id", user.id);
    if (error) { setProfileSaveError(t("username_taken_error")); setSavingProfile(false); return false; }
    setSavingProfile(false); fetchProfiles(); return true;
  }

  async function togglePremium() {
    if (!user || !myProfile) return;
    await supabase.from("profiles").update({ is_premium: !myProfile.is_premium }).eq("id", user.id);
    fetchProfiles();
  }

  async function changeLanguage(lang: Lang) {
    setLanguage(lang);
    if (user) { await supabase.from("profiles").update({ language: lang }).eq("id", user.id); fetchProfiles(); }
  }

  async function uploadAvatarFile(file: File): Promise<string | null> {
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("avatars").upload(fileName, file);
    if (error) return null;
    return supabase.storage.from("avatars").getPublicUrl(fileName).data.publicUrl;
  }

  async function handleAvatarChange(file: File) {
    if (!user) return;
    setUploadingAvatar(true);
    const url = await uploadAvatarFile(file);
    if (url) await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
    setUploadingAvatar(false); fetchProfiles();
  }

  async function changePassword() {
    if (newPasswordDraft.trim().length < 6) { setPasswordChangeMsg(t("password_too_short")); return; }
    setChangingPassword(true); setPasswordChangeMsg("");
    const { error } = await supabase.auth.updateUser({ password: newPasswordDraft });
    if (error) { setPasswordChangeMsg(error.message); setChangingPassword(false); return; }
    setPasswordChangeMsg(t("password_changed_success")); setNewPasswordDraft(""); setChangingPassword(false);
  }

  async function changeEmail() {
    if (!newEmailDraft.trim()) return;
    setChangingEmail(true); setEmailChangeMsg("");
    const { error } = await supabase.auth.updateUser({ email: newEmailDraft.trim() });
    if (error) { setEmailChangeMsg(error.message); setChangingEmail(false); return; }
    setEmailChangeMsg(t("email_change_confirm_msg")); setNewEmailDraft(""); setChangingEmail(false);
  }

  async function deleteAccount() {
    if (!user) return;
    setDeletingAccount(true);
    const tables = ["post_comments", "video_comments", "post_likes", "video_likes", "message_reactions", "direct_messages", "messages", "posts", "videos", "community_members", "notifications", "profiles"];
    for (const table of tables) {
      const col = table === "direct_messages" ? "sender_id" : table === "profiles" ? "id" : "user_id";
      await supabase.from(table).delete().eq(col, user.id);
    }
    await supabase.auth.signOut();
  }

  async function handleSignUp() {
    setAuthError("");
    if (!username.trim()) { setAuthError(t("enter_username_error")); return; }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { setAuthError(error.message); return; }
    if (data.user) {
      const { error: pe } = await supabase.from("profiles").insert({ id: data.user.id, username: username.trim() });
      if (pe) { setAuthError(t("username_taken_error")); return; }
      fetchProfiles();
    }
  }

  async function handleSignIn() {
    setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
  }

  async function handleSignOut() { await supabase.auth.signOut(); }

  async function saveUsername() {
    if (!user || !completeUsername.trim()) return;
    setSavingUsername(true); setCompleteError("");
    const { error } = await supabase.from("profiles").insert({ id: user.id, username: completeUsername.trim() });
    if (error) { setCompleteError(t("username_taken_error")); setSavingUsername(false); return; }
    setCompleteUsername(""); setSavingUsername(false); fetchProfiles();
  }

  function selectSection(id: string) {
    setSelectedId(id);
    const s = sections.find((x) => x.id === id);
    if (s) setSelectedSubId(s.subsections[0].id);
    setSelectedCommunity(null); setShowCreateCommunity(false); setShowManageRequests(false);
  }

  async function uploadVideoFile(file: File): Promise<string | null> {
    const fn = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("videos").upload(fn, file);
    if (error) return null;
    return supabase.storage.from("videos").getPublicUrl(fn).data.publicUrl;
  }

  async function sendMessage() {
    if (!user || (!newMessage.trim() && !newMessageVideo)) return;
    setSendingMessage(true);
    let video_url: string | null = null;
    if (newMessageVideo) video_url = await uploadVideoFile(newMessageVideo);
    await supabase.from("messages").insert({ section_id: selectedSubId, text: newMessage, video_url, user_id: user.id });
    setNewMessage(""); setNewMessageVideo(null); setSendingMessage(false);
  }

  async function addPost() {
    if (!user || !newPostTitle.trim()) return;
    setPublishingPost(true);
    let video_url: string | null = null;
    if (newPostVideo) video_url = await uploadVideoFile(newPostVideo);
    await supabase.from("posts").insert({ section_id: selectedSubId, title: newPostTitle, body: newPostBody, video_url, user_id: user.id, is_premium: newPostIsPremium });
    setNewPostTitle(""); setNewPostBody(""); setNewPostVideo(null); setNewPostIsPremium(false);
    setPublishingPost(false); fetchPosts();
  }

  async function uploadVideo() {
    if (!user || !videoFile || !newVideoTitle.trim()) return;
    setUploading(true);
    const url = await uploadVideoFile(videoFile);
    if (url) await supabase.from("videos").insert({ section_id: selectedSubId, title: newVideoTitle, url, user_id: user.id });
    setNewVideoTitle(""); setVideoFile(null); setUploading(false); fetchVideos();
  }

  // ===== لايك منشور مع إشعار =====
  async function togglePostLike(postId: number) {
    if (!user) return;
    const ex = postLikes.find((l) => l.post_id === postId && l.user_id === user.id);
    if (ex) {
      await supabase.from("post_likes").delete().eq("id", ex.id);
    } else {
      await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
      // إشعار لصاحب المنشور
      const post = posts.find((p) => p.id === postId);
      if (post?.user_id) await createNotification(post.user_id, user.id, "like_post", `${usernameFor(user.id)} ${t("notif_like_post")}`, postId);
    }
    fetchPostLikes();
  }

  // ===== لايك فيديو مع إشعار =====
  async function toggleVideoLike(videoId: number) {
    if (!user) return;
    const ex = videoLikes.find((l) => l.video_id === videoId && l.user_id === user.id);
    if (ex) {
      await supabase.from("video_likes").delete().eq("id", ex.id);
    } else {
      await supabase.from("video_likes").insert({ video_id: videoId, user_id: user.id });
      const video = videos.find((v) => v.id === videoId);
      if (video?.user_id) await createNotification(video.user_id, user.id, "like_video", `${usernameFor(user.id)} ${t("notif_like_video")}`, videoId);
    }
    fetchVideoLikes();
  }

  // ===== تعليق منشور مع إشعار =====
  async function addPostComment(postId: number) {
    if (!user) return;
    const text = (newPostCommentText[postId] || "").trim();
    if (!text) return;
    await supabase.from("post_comments").insert({ post_id: postId, user_id: user.id, text });
    const post = posts.find((p) => p.id === postId);
    if (post?.user_id) await createNotification(post.user_id, user.id, "comment_post", `${usernameFor(user.id)} ${t("notif_comment_post")}`, postId);
    setNewPostCommentText((prev) => ({ ...prev, [postId]: "" })); fetchPostComments();
  }

  // ===== تعليق فيديو مع إشعار =====
  async function addVideoComment(videoId: number) {
    if (!user) return;
    const text = (newVideoCommentText[videoId] || "").trim();
    if (!text) return;
    await supabase.from("video_comments").insert({ video_id: videoId, user_id: user.id, text });
    const video = videos.find((v) => v.id === videoId);
    if (video?.user_id) await createNotification(video.user_id, user.id, "comment_video", `${usernameFor(user.id)} ${t("notif_comment_video")}`, videoId);
    setNewVideoCommentText((prev) => ({ ...prev, [videoId]: "" })); fetchVideoComments();
  }

  async function deletePostComment(id: number) { await supabase.from("post_comments").delete().eq("id", id); fetchPostComments(); }
  async function deleteVideoComment(id: number) { await supabase.from("video_comments").delete().eq("id", id); fetchVideoComments(); }

  async function toggleReaction(messageId: number, emoji: string) {
    if (!user) return;
    const ex = messageReactions.find((r) => r.message_id === messageId && r.user_id === user.id && r.emoji === emoji);
    if (ex) await supabase.from("message_reactions").delete().eq("id", ex.id);
    else await supabase.from("message_reactions").insert({ message_id: messageId, user_id: user.id, emoji });
    fetchMessageReactions();
  }

  function reactionCount(messageId: number, emoji: string) { return messageReactions.filter((r) => r.message_id === messageId && r.emoji === emoji).length; }
  function hasReacted(messageId: number, emoji: string) { return !!user && messageReactions.some((r) => r.message_id === messageId && r.emoji === emoji && r.user_id === user.id); }
  function likeCountForPost(id: number) { return postLikes.filter((l) => l.post_id === id).length; }
  function isPostLikedByMe(id: number) { return !!user && postLikes.some((l) => l.post_id === id && l.user_id === user.id); }
  function commentsForPost(id: number) { return postComments.filter((c) => c.post_id === id); }
  function likeCountForVideo(id: number) { return videoLikes.filter((l) => l.video_id === id).length; }
  function isVideoLikedByMe(id: number) { return !!user && videoLikes.some((l) => l.video_id === id && l.user_id === user.id); }
  function commentsForVideo(id: number) { return videoComments.filter((c) => c.video_id === id); }

  function conversationPartners() {
    if (!user) return [];
    const ids = new Set<string>();
    directMessages.forEach((m) => { if (m.sender_id === user.id) ids.add(m.recipient_id); if (m.recipient_id === user.id) ids.add(m.sender_id); });
    return Array.from(ids);
  }

  function dmThreadWith(otherId: string) {
    if (!user) return [];
    return directMessages.filter((m) => (m.sender_id === user.id && m.recipient_id === otherId) || (m.sender_id === otherId && m.recipient_id === user.id)).sort((a, b) => a.id - b.id);
  }

  function lastDmWith(otherId: string) { const t = dmThreadWith(otherId); return t[t.length - 1]; }

  // ===== إرسال DM مع إشعار =====
  async function sendDirectMessage() {
    if (!user || !activeDmUserId || !newDmText.trim()) return;
    setSendingDm(true);
    await supabase.from("direct_messages").insert({ sender_id: user.id, recipient_id: activeDmUserId, text: newDmText.trim() });
    await createNotification(activeDmUserId, user.id, "dm", `${usernameFor(user.id)} ${t("notif_dm")}`);
    setNewDmText(""); setSendingDm(false);
  }

  function filteredPartners() {
    const partners = conversationPartners().sort((a, b) => new Date(lastDmWith(b)?.created_at || 0).getTime() - new Date(lastDmWith(a)?.created_at || 0).getTime());
    if (!dmSearch.trim()) return partners;
    return partners.filter((id) => usernameFor(id).toLowerCase().includes(dmSearch.toLowerCase()));
  }

  // ===== إنشاء مجتمع =====
  async function createCommunity() {
    if (!user || !myProfile?.is_premium || !newCommunityName.trim()) return;
    setCreatingCommunity(true);
    const { data: newComm, error } = await supabase.from("communities").insert({
      name: newCommunityName.trim(), description: newCommunityDesc.trim() || null,
      section_id: selectedId, owner_id: user.id, color: newCommunityColor, is_private: newCommunityPrivate,
      game_name: selectedId === "gaming" ? newGameName : null, game_platform: selectedId === "gaming" ? newGamePlatform : null, game_type: selectedId === "gaming" ? newGameType : null,
      edit_type: selectedId === "editing" ? newEditType : null, edit_software: selectedId === "editing" ? newEditSoftware : null, edit_level: selectedId === "editing" ? newEditLevel : null,
      movies_genre: selectedId === "movies" ? newMoviesGenre : null, movies_source: selectedId === "movies" ? newMoviesSource : null, movies_language: selectedId === "movies" ? newMoviesLanguage : null,
      sport_type: selectedId === "sports" ? newSportType : null, sport_team: selectedId === "sports" ? newSportTeam : null, sport_content: selectedId === "sports" ? newSportContent : null,
    }).select().single();
    if (!error && newComm) {
      await supabase.from("community_members").insert({ community_id: newComm.id, user_id: user.id, status: "approved" });
      setShowCreateCommunity(false);
      setNewCommunityName(""); setNewCommunityDesc(""); setNewCommunityColor("#9B6BFF");
      setNewGameName(""); setNewGamePlatform(""); setNewGameType("");
      setNewEditType(""); setNewEditSoftware(""); setNewEditLevel("");
      setNewMoviesGenre(""); setNewMoviesSource(""); setNewMoviesLanguage("");
      setNewSportType(""); setNewSportTeam(""); setNewSportContent("");
      fetchCommunities(); fetchCommunityMembers();
    }
    setCreatingCommunity(false);
  }

  // ===== انضمام مجتمع مع إشعار =====
  async function joinCommunity(communityId: number) {
    if (!user) return;
    await supabase.from("community_members").insert({ community_id: communityId, user_id: user.id, status: "pending" });
    const community = communities.find((c) => c.id === communityId);
    if (community?.owner_id) await createNotification(community.owner_id, user.id, "join_request", `${usernameFor(user.id)} ${t("notif_join_request")}`, communityId);
    fetchCommunityMembers();
  }

  // ===== قبول عضو مع إشعار =====
  async function approveMember(memberId: number) {
    const member = communityMembers.find((m) => m.id === memberId);
    await supabase.from("community_members").update({ status: "approved" }).eq("id", memberId);
    if (member && user) await createNotification(member.user_id, user.id, "join_approved", t("notif_join_approved"), member.community_id);
    fetchCommunityMembers();
  }

  // ===== رفض عضو مع إشعار =====
  async function rejectMember(memberId: number) {
    const member = communityMembers.find((m) => m.id === memberId);
    await supabase.from("community_members").delete().eq("id", memberId);
    if (member && user) await createNotification(member.user_id, user.id, "join_rejected", t("notif_join_rejected"), member.community_id);
    fetchCommunityMembers();
  }

  const postsForSection = posts.filter((p) => p.section_id === selectedSubId);
  const messagesForSection = messages.filter((m) => m.section_id === selectedSubId);
  const videosForSection = videos.filter((v) => v.section_id === selectedSubId);
  const communitiesForSection = communities.filter((c) => c.section_id === selectedId);
  const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #1E1B2E", background: "#1A1726", color: "white", fontSize: "14px", outline: "none", boxSizing: "border-box" as const };
  const selectStyle = { ...inputStyle, cursor: "pointer" };

  const notifIcons: Record<string, string> = { like_post: "❤️", like_video: "❤️", comment_post: "💬", comment_video: "💬", dm: "✉️", join_request: "👥", join_approved: "✅", join_rejected: "❌" };

  if (authLoading) return <main style={{ background: "#100F17", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#9C97B8" }}>{t("loading")}</div></main>;

  if (!user) return (
    <main style={{ background: "#100F17", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", direction: dir }}>
      <div style={{ background: "#1A1826", padding: "32px", borderRadius: "16px", width: "320px" }}>
        <h1 style={{ color: "white", fontSize: "22px", marginBottom: "20px" }}>{t("login_title")}</h1>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t("username_signup_placeholder")} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #2E2A42", background: "#221F32", color: "white", marginBottom: "10px" }} />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("email_placeholder")} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #2E2A42", background: "#221F32", color: "white", marginBottom: "10px" }} />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder={t("password_placeholder")} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #2E2A42", background: "#221F32", color: "white", marginBottom: "10px" }} />
        {authError && <div style={{ color: "#FF3D8A", fontSize: "13px", marginBottom: "10px" }}>{authError}</div>}
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={handleSignIn} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: "#9B6BFF", color: "#0A0910", cursor: "pointer" }}>{t("login_button")}</button>
          <button onClick={handleSignUp} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #2E2A42", background: "transparent", color: "white", cursor: "pointer" }}>{t("signup_button")}</button>
        </div>
      </div>
    </main>
  );

  if (!profilesLoaded) return <main style={{ background: "#100F17", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#9C97B8" }}>{t("loading")}</div></main>;

  const myProfile = profiles.find((p) => p.id === user.id);

  if (!myProfile) return (
    <main style={{ background: "#100F17", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", direction: dir }}>
      <div style={{ background: "#1A1826", padding: "32px", borderRadius: "16px", width: "320px" }}>
        <h1 style={{ color: "white", fontSize: "20px", marginBottom: "10px" }}>{t("choose_username_title")}</h1>
        <div style={{ color: "#9C97B8", fontSize: "13px", marginBottom: "16px" }}>{t("choose_username_desc")}</div>
        <input value={completeUsername} onChange={(e) => setCompleteUsername(e.target.value)} placeholder={t("username_label")} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #2E2A42", background: "#221F32", color: "white", marginBottom: "10px" }} />
        {completeError && <div style={{ color: "#FF3D8A", fontSize: "13px", marginBottom: "10px" }}>{completeError}</div>}
        <button onClick={saveUsername} disabled={savingUsername} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "none", background: "#9B6BFF", color: "#0A0910", cursor: "pointer" }}>{savingUsername ? "..." : t("save")}</button>
      </div>
    </main>
  );

  return (
    <main style={{ background: "#100F17", minHeight: "100vh", padding: "40px", direction: dir }}>

      {/* ===== Toast Notification ===== */}
      {toastNotif && (
        <ToastNotification
          notif={toastNotif}
          onClose={() => setToastNotif(null)}
        />
      )}

      {/* ===== هيدر ===== */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ color: "white", fontSize: "28px" }}>{t("main_sections")}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={handleSignOut} style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid #2E2A42", background: "transparent", color: "#9C97B8", cursor: "pointer", fontSize: "13px" }}>{t("logout")}</button>

          {/* ===== زر الإشعارات ===== */}
          <div style={{ position: "relative" }} ref={notifPanelRef}>
            <button
              onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) markAllRead(); }}
              style={{ position: "relative", background: "#1A1826", border: "1px solid #2E2A42", borderRadius: "50%", width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadNotifCount > 0 && (
                <div style={{ position: "absolute", top: "-2px", right: "-2px", width: "18px", height: "18px", borderRadius: "50%", background: "#FF3D8A", color: "white", fontSize: "10px", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #100F17" }}>
                  {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
                </div>
              )}
            </button>

            {/* قائمة الإشعارات */}
            {showNotifications && (
              <div style={{ position: "absolute", top: "46px", right: "0", width: "340px", background: "#13111E", border: "1px solid #1E1B2E", borderRadius: "16px", boxShadow: "0 8px 40px rgba(0,0,0,0.6)", zIndex: 2000, overflow: "hidden" }}>
                {/* هيدر */}
                <div style={{ padding: "16px", borderBottom: "1px solid #1E1B2E", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ color: "white", fontWeight: "bold", fontSize: "16px" }}>{t("notifications_title")}</span>
                  {unreadNotifCount > 0 && (
                    <button onClick={markAllRead} style={{ background: "transparent", border: "none", color: "#9B6BFF", cursor: "pointer", fontSize: "12px" }}>{t("mark_all_read")}</button>
                  )}
                </div>

                {/* قائمة */}
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  {notifications.length === 0 ? (
                    <div style={{ color: "#635E80", textAlign: "center", padding: "40px 20px", fontSize: "13px" }}>{t("no_notifications")}</div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markOneRead(notif.id)}
                        style={{ padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: "10px", borderBottom: "1px solid #1A1726", background: notif.is_read ? "transparent" : "rgba(155,107,255,0.06)", cursor: "pointer", transition: "background 0.15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#1A1726")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = notif.is_read ? "transparent" : "rgba(155,107,255,0.06)")}
                      >
                        {/* أيقونة + أفاتار */}
                        <div style={{ position: "relative", flexShrink: 0 }}>
                          <Avatar name={usernameFor(notif.from_user_id)} avatarUrl={avatarUrlFor(notif.from_user_id)} size={38} onClick={() => viewProfile(notif.from_user_id || undefined)} />
                          <div style={{ position: "absolute", bottom: "-2px", right: "-2px", fontSize: "14px", background: "#13111E", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {notifIcons[notif.type] || "🔔"}
                          </div>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ color: "white", fontSize: "13px", lineHeight: "1.4", marginBottom: "4px" }}>{notif.message}</div>
                          <div style={{ color: "#635E80", fontSize: "11px" }}>{timeAgo(notif.created_at)}</div>
                        </div>
                        {!notif.is_read && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#9B6BFF", flexShrink: 0, marginTop: "5px" }} />}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* أفاتار */}
          <div style={{ position: "relative" }}>
            <Avatar name={myProfile.username} avatarUrl={myProfile.avatar_url} size={36} onClick={() => viewProfile(user.id)} />
            {myProfile.is_premium && <span style={{ position: "absolute", bottom: -2, right: -2, fontSize: "13px" }}>💎</span>}
          </div>
        </div>
      </div>

      {/* أقسام رئيسية */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
        {sections.map((s) => (
          <div key={s.id} onClick={() => selectSection(s.id)} style={{ background: selectedId === s.id ? s.color : "#1A1826", border: `2px solid ${s.color}`, borderRadius: "12px", padding: "20px", color: selectedId === s.id ? "#0A0910" : "white", width: "200px", cursor: "pointer", fontWeight: "bold" }}>
            {s.name}
          </div>
        ))}
      </div>

      {/* تبويبات */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
        {(["chat", "posts", "videos", "communities"] as const).map((tabKey) => (
          <button key={tabKey} onClick={() => { setTab(tabKey); setSelectedCommunity(null); setShowCreateCommunity(false); }} style={{ padding: "8px 20px", borderRadius: "8px", border: "none", background: tab === tabKey ? "#9B6BFF" : "#1A1826", color: tab === tabKey ? "#0A0910" : "#9C97B8", cursor: "pointer", fontWeight: tab === tabKey ? "bold" : "normal" }}>
            {t(tabKey === "chat" ? "tab_chat" : tabKey === "posts" ? "tab_posts" : tabKey === "videos" ? "tab_videos" : "tab_communities")}
          </button>
        ))}
      </div>

      {/* ===== شات ===== */}
      {tab === "chat" && (
        <div>
          <div style={{ background: "#1A1826", borderRadius: "12px", padding: "16px", maxWidth: "460px", marginBottom: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {messagesForSection.length === 0 && <div style={{ color: "#635E80" }}>{t("no_messages")}</div>}
            {messagesForSection.map((msg) => (
              <div key={msg.id} style={{ color: "#EDEAF6" }}>
                <div onClick={() => viewProfile(msg.user_id)} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", width: "fit-content", marginBottom: "2px" }}>
                  <Avatar name={usernameFor(msg.user_id)} avatarUrl={avatarUrlFor(msg.user_id)} size={20} />
                  <span style={{ color: "#9B6BFF", fontSize: "12px", fontWeight: "bold" }}>{usernameFor(msg.user_id)}</span>
                  {isPremiumUser(msg.user_id) && <span style={{ fontSize: "11px" }}>💎</span>}
                </div>
                {msg.text && <div>{msg.text}</div>}
                {msg.video_url && <video src={msg.video_url} controls style={{ width: "100%", borderRadius: "8px", marginTop: "4px" }} />}
                <div style={{ display: "flex", gap: "4px", marginTop: "4px", flexWrap: "wrap" }}>
                  {REACTION_EMOJIS.map((emoji) => {
                    const count = reactionCount(msg.id, emoji); const mine = hasReacted(msg.id, emoji);
                    return <button key={emoji} onClick={() => toggleReaction(msg.id, emoji)} style={{ padding: "2px 6px", borderRadius: "10px", border: mine ? "1px solid #9B6BFF" : "1px solid #2E2A42", background: mine ? "#2A2340" : "#100F17", color: "#EDEAF6", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "3px" }}>{emoji}{count > 0 && <span style={{ fontSize: "11px", color: "#9C97B8" }}>{count}</span>}</button>;
                  })}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "460px" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder={t("type_message_placeholder")} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #2E2A42", background: "#1A1826", color: "white" }} />
              <button onClick={sendMessage} disabled={sendingMessage} style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: "#9B6BFF", color: "#0A0910", cursor: "pointer", opacity: sendingMessage ? 0.6 : 1 }}>{sendingMessage ? "..." : t("send")}</button>
            </div>
            <input type="file" accept="video/*" onChange={(e) => setNewMessageVideo(e.target.files?.[0] || null)} style={{ color: "#9C97B8", fontSize: "13px" }} />
          </div>
        </div>
      )}

      {/* ===== منشورات ===== */}
      {tab === "posts" && (
        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "500px", marginBottom: "20px" }}>
            {postsForSection.length === 0 && <div style={{ color: "#635E80" }}>{t("no_posts")}</div>}
            {postsForSection.map((post) => {
              const locked = post.is_premium && !myProfile.is_premium && post.user_id !== user.id;
              return (
                <div key={post.id} style={{ background: "#1A1826", border: post.is_premium ? "1px solid #9B6BFF" : "1px solid #2E2A42", borderRadius: "12px", padding: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <div style={{ color: "white", fontWeight: "bold" }}>{post.title}</div>
                    {post.is_premium && <span>💎</span>}
                  </div>
                  <div onClick={() => viewProfile(post.user_id)} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", width: "fit-content", marginBottom: "8px" }}>
                    <Avatar name={usernameFor(post.user_id)} avatarUrl={avatarUrlFor(post.user_id)} size={20} />
                    <span style={{ color: "#9B6BFF", fontSize: "12px" }}>{usernameFor(post.user_id)}</span>
                    {isPremiumUser(post.user_id) && <span style={{ fontSize: "11px" }}>💎</span>}
                  </div>
                  {locked ? (
                    <div style={{ background: "#221F32", border: "1px dashed #9B6BFF", borderRadius: "10px", padding: "20px", textAlign: "center" }}>
                      <div style={{ fontSize: "22px", marginBottom: "6px" }}>🔒</div>
                      <div style={{ color: "white", fontWeight: "bold", marginBottom: "4px" }}>{t("premium_content_title")}</div>
                      <div style={{ color: "#9C97B8", fontSize: "13px", marginBottom: "12px" }}>{t("premium_content_desc")}</div>
                      <button onClick={() => viewProfile(user.id)} style={{ padding: "8px 16px", borderRadius: "8px", border: "none", background: "#9B6BFF", color: "#0A0910", cursor: "pointer", fontSize: "13px" }}>{t("unlock_premium_button")}</button>
                    </div>
                  ) : (
                    <>
                      {post.body && <div style={{ color: "#9C97B8", fontSize: "14px", marginBottom: "8px" }}>{post.body}</div>}
                      {post.video_url && <video src={post.video_url} controls style={{ width: "100%", borderRadius: "8px", marginBottom: "10px" }} />}
                      <button onClick={() => togglePostLike(post.id)} style={{ padding: "5px 12px", borderRadius: "8px", border: "1px solid #2E2A42", background: isPostLikedByMe(post.id) ? "#9B6BFF" : "transparent", color: isPostLikedByMe(post.id) ? "#0A0910" : "#9C97B8", cursor: "pointer", fontSize: "13px", marginBottom: "10px" }}>♥ {likeCountForPost(post.id)}</button>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {commentsForPost(post.id).map((c) => (
                          <div key={c.id} style={{ fontSize: "13px", display: "flex", justifyContent: "space-between", gap: "6px" }}>
                            <div><span onClick={() => viewProfile(c.user_id)} style={{ color: "#9B6BFF", fontWeight: "bold", cursor: "pointer" }}>{usernameFor(c.user_id)}: </span><span style={{ color: "#EDEAF6" }}>{c.text}</span></div>
                            {user.id === c.user_id && <button onClick={() => deletePostComment(c.id)} style={{ background: "transparent", border: "none", color: "#635E80", cursor: "pointer" }}>✕</button>}
                          </div>
                        ))}
                        <div style={{ display: "flex", gap: "6px" }}>
                          <input value={newPostCommentText[post.id] || ""} onChange={(e) => setNewPostCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && addPostComment(post.id)} placeholder={t("write_comment_placeholder")} style={{ flex: 1, padding: "6px 10px", borderRadius: "6px", border: "1px solid #2E2A42", background: "#100F17", color: "white", fontSize: "13px" }} />
                          <button onClick={() => addPostComment(post.id)} style={{ padding: "6px 12px", borderRadius: "6px", border: "none", background: "#9B6BFF", color: "#0A0910", cursor: "pointer", fontSize: "13px" }}>{t("comment_button")}</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "500px" }}>
            <input value={newPostTitle} onChange={(e) => setNewPostTitle(e.target.value)} placeholder={t("post_title_placeholder")} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #2E2A42", background: "#1A1826", color: "white" }} />
            <textarea value={newPostBody} onChange={(e) => setNewPostBody(e.target.value)} placeholder={t("post_body_placeholder")} rows={3} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #2E2A42", background: "#1A1826", color: "white", fontFamily: "inherit" }} />
            <input type="file" accept="video/*" onChange={(e) => setNewPostVideo(e.target.files?.[0] || null)} style={{ color: "#9C97B8", fontSize: "13px" }} />
            <label style={{ display: "flex", alignItems: "center", gap: "6px", color: "#9C97B8", fontSize: "13px", cursor: "pointer" }}>
              <input type="checkbox" checked={newPostIsPremium} onChange={(e) => setNewPostIsPremium(e.target.checked)} />
              {t("premium_only_checkbox_label")}
            </label>
            <button onClick={addPost} disabled={publishingPost} style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: "#9B6BFF", color: "#0A0910", cursor: "pointer", alignSelf: "flex-start", opacity: publishingPost ? 0.6 : 1 }}>{publishingPost ? t("publishing") : t("publish")}</button>
          </div>
        </div>
      )}

      {/* ===== فيديوهات ===== */}
      {tab === "videos" && (
        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "500px", marginBottom: "24px" }}>
            {videosForSection.length === 0 && <div style={{ color: "#635E80" }}>{t("no_videos")}</div>}
            {videosForSection.map((video) => (
              <div key={video.id} style={{ background: "#1A1826", border: "1px solid #2E2A42", borderRadius: "12px", padding: "16px" }}>
                <div style={{ color: "white", fontWeight: "bold", marginBottom: "4px" }}>{video.title}</div>
                <div onClick={() => viewProfile(video.user_id)} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", width: "fit-content", marginBottom: "10px" }}>
                  <Avatar name={usernameFor(video.user_id)} avatarUrl={avatarUrlFor(video.user_id)} size={20} />
                  <span style={{ color: "#9B6BFF", fontSize: "12px" }}>{usernameFor(video.user_id)}</span>
                  {isPremiumUser(video.user_id) && <span style={{ fontSize: "11px" }}>💎</span>}
                </div>
                <video src={video.url} controls style={{ width: "100%", borderRadius: "8px", marginBottom: "10px" }} />
                <button onClick={() => toggleVideoLike(video.id)} style={{ padding: "5px 12px", borderRadius: "8px", border: "1px solid #2E2A42", background: isVideoLikedByMe(video.id) ? "#9B6BFF" : "transparent", color: isVideoLikedByMe(video.id) ? "#0A0910" : "#9C97B8", cursor: "pointer", fontSize: "13px", marginBottom: "10px" }}>♥ {likeCountForVideo(video.id)}</button>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {commentsForVideo(video.id).map((c) => (
                    <div key={c.id} style={{ fontSize: "13px", display: "flex", justifyContent: "space-between", gap: "6px" }}>
                      <div><span onClick={() => viewProfile(c.user_id)} style={{ color: "#9B6BFF", fontWeight: "bold", cursor: "pointer" }}>{usernameFor(c.user_id)}: </span><span style={{ color: "#EDEAF6" }}>{c.text}</span></div>
                      {user.id === c.user_id && <button onClick={() => deleteVideoComment(c.id)} style={{ background: "transparent", border: "none", color: "#635E80", cursor: "pointer" }}>✕</button>}
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input value={newVideoCommentText[video.id] || ""} onChange={(e) => setNewVideoCommentText((prev) => ({ ...prev, [video.id]: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && addVideoComment(video.id)} placeholder={t("write_comment_placeholder")} style={{ flex: 1, padding: "6px 10px", borderRadius: "6px", border: "1px solid #2E2A42", background: "#100F17", color: "white", fontSize: "13px" }} />
                    <button onClick={() => addVideoComment(video.id)} style={{ padding: "6px 12px", borderRadius: "6px", border: "none", background: "#9B6BFF", color: "#0A0910", cursor: "pointer", fontSize: "13px" }}>{t("comment_button")}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "500px" }}>
            <input value={newVideoTitle} onChange={(e) => setNewVideoTitle(e.target.value)} placeholder={t("video_title_placeholder")} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #2E2A42", background: "#1A1826", color: "white" }} />
            <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} style={{ color: "#9C97B8" }} />
            <button onClick={uploadVideo} disabled={uploading} style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: "#9B6BFF", color: "#0A0910", cursor: "pointer", alignSelf: "flex-start", opacity: uploading ? 0.6 : 1 }}>{uploading ? t("uploading_video") : t("upload_video")}</button>
          </div>
        </div>
      )}

      {/* ===== مجتمعات ===== */}
      {tab === "communities" && (
        <div style={{ maxWidth: "700px" }}>
          {selectedCommunity && !showCreateCommunity && !showManageRequests && (
            <div>
              <button onClick={() => setSelectedCommunity(null)} style={{ background: "transparent", border: "none", color: "#9B6BFF", cursor: "pointer", fontSize: "13px", marginBottom: "20px", padding: 0 }}>{t("back_to_communities")}</button>
              <div style={{ background: "#1A1826", borderRadius: "16px", padding: "24px", marginBottom: "20px", borderTop: `4px solid ${selectedCommunity.color}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: selectedCommunity.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "bold", color: "white" }}>{selectedCommunity.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <div style={{ color: "white", fontWeight: "bold", fontSize: "20px" }}>{selectedCommunity.name}</div>
                        <div style={{ color: "#9C97B8", fontSize: "12px" }}>{communityMembersCount(selectedCommunity.id)} {t("members_count")}</div>
                      </div>
                    </div>
                    {selectedCommunity.description && <div style={{ color: "#9C97B8", fontSize: "14px", marginBottom: "8px" }}>{selectedCommunity.description}</div>}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ color: "#635E80", fontSize: "12px" }}>{t("owner_label")}:</span>
                      <span onClick={() => viewProfile(selectedCommunity.owner_id)} style={{ color: "#9B6BFF", fontSize: "12px", cursor: "pointer" }}>{usernameFor(selectedCommunity.owner_id)}</span>
                    </div>
                  </div>
                  {user.id === selectedCommunity.owner_id && (
                    <button onClick={() => setShowManageRequests(true)} style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #9B6BFF", background: "transparent", color: "#9B6BFF", cursor: "pointer", fontSize: "13px" }}>
                      {t("manage_requests")} ({pendingRequests(selectedCommunity.id).length})
                    </button>
                  )}
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
                  {selectedCommunity.game_name && <span style={{ background: "#221F32", color: "#9B6BFF", padding: "4px 10px", borderRadius: "20px", fontSize: "12px" }}>🎮 {selectedCommunity.game_name}</span>}
                  {selectedCommunity.edit_type && <span style={{ background: "#221F32", color: "#FF3D8A", padding: "4px 10px", borderRadius: "20px", fontSize: "12px" }}>🎬 {selectedCommunity.edit_type}</span>}
                  {selectedCommunity.movies_genre && <span style={{ background: "#221F32", color: "#FFC24B", padding: "4px 10px", borderRadius: "20px", fontSize: "12px" }}>🎥 {selectedCommunity.movies_genre}</span>}
                  {selectedCommunity.sport_type && <span style={{ background: "#221F32", color: "#22D3EE", padding: "4px 10px", borderRadius: "20px", fontSize: "12px" }}>⚽ {selectedCommunity.sport_type}</span>}
                </div>
              </div>
              <div style={{ background: "#1A1826", borderRadius: "12px", padding: "16px" }}>
                <div style={{ color: "white", fontWeight: "bold", marginBottom: "12px" }}>{t("community_members")}</div>
                {communityMembers.filter((m) => m.community_id === selectedCommunity.id && m.status === "approved").map((m) => (
                  <div key={m.id} onClick={() => viewProfile(m.user_id)} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "6px", borderRadius: "8px" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#221F32")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <Avatar name={usernameFor(m.user_id)} avatarUrl={avatarUrlFor(m.user_id)} size={32} />
                    <span style={{ color: "white", fontSize: "14px" }}>{usernameFor(m.user_id)}</span>
                    {m.user_id === selectedCommunity.owner_id && <span style={{ background: "#9B6BFF", color: "white", fontSize: "10px", padding: "2px 6px", borderRadius: "10px" }}>👑</span>}
                    {isPremiumUser(m.user_id) && <span style={{ fontSize: "11px" }}>💎</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedCommunity && showManageRequests && (
            <div>
              <button onClick={() => setShowManageRequests(false)} style={{ background: "transparent", border: "none", color: "#9B6BFF", cursor: "pointer", fontSize: "13px", marginBottom: "20px", padding: 0 }}>← {t("back_to_communities")}</button>
              <div style={{ color: "white", fontWeight: "bold", fontSize: "18px", marginBottom: "16px" }}>{t("manage_requests")}</div>
              {pendingRequests(selectedCommunity.id).length === 0 ? <div style={{ color: "#635E80" }}>{t("no_pending")}</div> : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {pendingRequests(selectedCommunity.id).map((req) => (
                    <div key={req.id} style={{ background: "#1A1826", borderRadius: "12px", padding: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                      <div onClick={() => viewProfile(req.user_id)} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                        <Avatar name={usernameFor(req.user_id)} avatarUrl={avatarUrlFor(req.user_id)} size={36} />
                        <div>
                          <div style={{ color: "white", fontSize: "14px", fontWeight: "bold" }}>{usernameFor(req.user_id)}</div>
                          <div style={{ color: "#635E80", fontSize: "11px" }}>{new Date(req.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => approveMember(req.id)} style={{ padding: "6px 14px", borderRadius: "8px", border: "none", background: "#4ADE80", color: "#0A0910", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}>{t("approve")}</button>
                        <button onClick={() => rejectMember(req.id)} style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid #FF3D8A", background: "transparent", color: "#FF3D8A", cursor: "pointer", fontSize: "13px" }}>{t("reject")}</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {showCreateCommunity && !selectedCommunity && (
            <div>
              <button onClick={() => setShowCreateCommunity(false)} style={{ background: "transparent", border: "none", color: "#9B6BFF", cursor: "pointer", fontSize: "13px", marginBottom: "20px", padding: 0 }}>{t("back_to_communities")}</button>
              <div style={{ background: "#1A1826", borderRadius: "16px", padding: "24px" }}>
                <div style={{ color: "white", fontWeight: "bold", fontSize: "20px", marginBottom: "20px" }}>{t("create_community")}</div>
                <div style={{ marginBottom: "14px" }}><div style={{ color: "#9C97B8", fontSize: "13px", marginBottom: "6px" }}>{t("community_name")} *</div><input value={newCommunityName} onChange={(e) => setNewCommunityName(e.target.value)} style={inputStyle} /></div>
                <div style={{ marginBottom: "14px" }}><div style={{ color: "#9C97B8", fontSize: "13px", marginBottom: "6px" }}>{t("community_desc")}</div><textarea value={newCommunityDesc} onChange={(e) => setNewCommunityDesc(e.target.value)} rows={3} style={{ ...inputStyle, resize: "none" }} /></div>
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ color: "#9C97B8", fontSize: "13px", marginBottom: "6px" }}>{t("community_color")}</div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    {["#9B6BFF", "#FF3D8A", "#FFC24B", "#22D3EE", "#4ADE80", "#F97316", "#EC4899"].map((color) => (
                      <div key={color} onClick={() => setNewCommunityColor(color)} style={{ width: "28px", height: "28px", borderRadius: "50%", background: color, cursor: "pointer", border: newCommunityColor === color ? "3px solid white" : "3px solid transparent" }} />
                    ))}
                    <input type="color" value={newCommunityColor} onChange={(e) => setNewCommunityColor(e.target.value)} style={{ width: "32px", height: "32px", borderRadius: "50%", border: "none", cursor: "pointer" }} />
                  </div>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "#9C97B8", fontSize: "13px", cursor: "pointer", marginBottom: "20px" }}>
                  <input type="checkbox" checked={newCommunityPrivate} onChange={(e) => setNewCommunityPrivate(e.target.checked)} />
                  {t("community_private")}
                </label>
                {selectedId === "gaming" && (
                  <div style={{ borderTop: "1px solid #2E2A42", paddingTop: "16px", marginBottom: "16px" }}>
                    <div style={{ color: "#9B6BFF", fontSize: "13px", fontWeight: "bold", marginBottom: "12px" }}>🎮 {t("section_gaming")}</div>
                    <div style={{ marginBottom: "10px" }}><div style={{ color: "#9C97B8", fontSize: "12px", marginBottom: "5px" }}>{t("game_name_label")}</div><input value={newGameName} onChange={(e) => setNewGameName(e.target.value)} placeholder="Fortnite, FIFA..." style={inputStyle} /></div>
                    <div style={{ marginBottom: "10px" }}><div style={{ color: "#9C97B8", fontSize: "12px", marginBottom: "5px" }}>{t("game_platform_label")}</div><select value={newGamePlatform} onChange={(e) => setNewGamePlatform(e.target.value)} style={selectStyle}><option value="">-- اختر --</option><option>PC</option><option>PlayStation</option><option>Xbox</option><option>Mobile</option><option>Nintendo Switch</option></select></div>
                    <div style={{ marginBottom: "10px" }}><div style={{ color: "#9C97B8", fontSize: "12px", marginBottom: "5px" }}>{t("game_type_label")}</div><select value={newGameType} onChange={(e) => setNewGameType(e.target.value)} style={selectStyle}><option value="">-- اختر --</option><option>تنافسي</option><option>كاجوال</option><option>تطوير ألعاب</option><option>استراتيجية</option><option>RPG</option></select></div>
                  </div>
                )}
                {selectedId === "editing" && (
                  <div style={{ borderTop: "1px solid #2E2A42", paddingTop: "16px", marginBottom: "16px" }}>
                    <div style={{ color: "#FF3D8A", fontSize: "13px", fontWeight: "bold", marginBottom: "12px" }}>🎬 {t("section_editing")}</div>
                    <div style={{ marginBottom: "10px" }}><div style={{ color: "#9C97B8", fontSize: "12px", marginBottom: "5px" }}>{t("edit_type_label")}</div><select value={newEditType} onChange={(e) => setNewEditType(e.target.value)} style={selectStyle}><option value="">-- اختر --</option><option>فيديو كليب</option><option>شورتس/ريلز</option><option>سينمائي</option><option>موشن جرافيك</option><option>VFX</option></select></div>
                    <div style={{ marginBottom: "10px" }}><div style={{ color: "#9C97B8", fontSize: "12px", marginBottom: "5px" }}>{t("edit_software_label")}</div><select value={newEditSoftware} onChange={(e) => setNewEditSoftware(e.target.value)} style={selectStyle}><option value="">-- اختر --</option><option>Adobe Premiere</option><option>After Effects</option><option>CapCut</option><option>DaVinci Resolve</option><option>Final Cut Pro</option></select></div>
                    <div style={{ marginBottom: "10px" }}><div style={{ color: "#9C97B8", fontSize: "12px", marginBottom: "5px" }}>{t("edit_level_label")}</div><select value={newEditLevel} onChange={(e) => setNewEditLevel(e.target.value)} style={selectStyle}><option value="">-- اختر --</option><option>مبتدئ</option><option>متوسط</option><option>محترف</option></select></div>
                  </div>
                )}
                {selectedId === "movies" && (
                  <div style={{ borderTop: "1px solid #2E2A42", paddingTop: "16px", marginBottom: "16px" }}>
                    <div style={{ color: "#FFC24B", fontSize: "13px", fontWeight: "bold", marginBottom: "12px" }}>🎥 {t("section_movies")}</div>
                    <div style={{ marginBottom: "10px" }}><div style={{ color: "#9C97B8", fontSize: "12px", marginBottom: "5px" }}>{t("movies_genre_label")}</div><select value={newMoviesGenre} onChange={(e) => setNewMoviesGenre(e.target.value)} style={selectStyle}><option value="">-- اختر --</option><option>أكشن</option><option>رومانسي</option><option>رعب</option><option>كوميدي</option><option>دراما</option><option>خيال علمي</option><option>أنمي</option></select></div>
                    <div style={{ marginBottom: "10px" }}><div style={{ color: "#9C97B8", fontSize: "12px", marginBottom: "5px" }}>{t("movies_source_label")}</div><select value={newMoviesSource} onChange={(e) => setNewMoviesSource(e.target.value)} style={selectStyle}><option value="">-- اختر --</option><option>Netflix</option><option>Disney+</option><option>Amazon Prime</option><option>كوري</option><option>هندي</option><option>عربي</option><option>أنمي</option></select></div>
                    <div style={{ marginBottom: "10px" }}><div style={{ color: "#9C97B8", fontSize: "12px", marginBottom: "5px" }}>{t("movies_language_label")}</div><select value={newMoviesLanguage} onChange={(e) => setNewMoviesLanguage(e.target.value)} style={selectStyle}><option value="">-- اختر --</option><option>عربي</option><option>إنجليزي</option><option>كوري</option><option>ياباني</option><option>هندي</option><option>فرنسي</option></select></div>
                  </div>
                )}
                {selectedId === "sports" && (
                  <div style={{ borderTop: "1px solid #2E2A42", paddingTop: "16px", marginBottom: "16px" }}>
                    <div style={{ color: "#22D3EE", fontSize: "13px", fontWeight: "bold", marginBottom: "12px" }}>⚽ {t("section_sports")}</div>
                    <div style={{ marginBottom: "10px" }}><div style={{ color: "#9C97B8", fontSize: "12px", marginBottom: "5px" }}>{t("sport_type_label")}</div><select value={newSportType} onChange={(e) => setNewSportType(e.target.value)} style={selectStyle}><option value="">-- اختر --</option><option>كرة قدم</option><option>كرة سلة</option><option>تنس</option><option>سباحة</option><option>كرة طائرة</option><option>ألعاب قوى</option></select></div>
                    <div style={{ marginBottom: "10px" }}><div style={{ color: "#9C97B8", fontSize: "12px", marginBottom: "5px" }}>{t("sport_team_label")}</div><input value={newSportTeam} onChange={(e) => setNewSportTeam(e.target.value)} placeholder="ريال مدريد..." style={inputStyle} /></div>
                    <div style={{ marginBottom: "10px" }}><div style={{ color: "#9C97B8", fontSize: "12px", marginBottom: "5px" }}>{t("sport_content_label")}</div><select value={newSportContent} onChange={(e) => setNewSportContent(e.target.value)} style={selectStyle}><option value="">-- اختر --</option><option>أخبار</option><option>تحليل مباريات</option><option>مباريات مباشرة</option><option>إحصائيات</option></select></div>
                  </div>
                )}
                <button onClick={createCommunity} disabled={creatingCommunity || !newCommunityName.trim()} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #9B6BFF, #FF3D8A)", color: "white", cursor: "pointer", fontSize: "15px", fontWeight: "bold", opacity: creatingCommunity || !newCommunityName.trim() ? 0.6 : 1 }}>
                  {creatingCommunity ? t("creating") : t("create_community")}
                </button>
              </div>
            </div>
          )}

          {!selectedCommunity && !showCreateCommunity && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <div style={{ color: "white", fontWeight: "bold", fontSize: "20px" }}>{t("communities_title")} — {selectedSection?.name}</div>
                {myProfile.is_premium ? (
                  <button onClick={() => setShowCreateCommunity(true)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #9B6BFF, #FF3D8A)", color: "white", cursor: "pointer", fontSize: "14px", fontWeight: "bold" }}>
                    <span style={{ fontSize: "18px" }}>+</span> {t("create_community")}
                  </button>
                ) : (
                  <div style={{ color: "#9C97B8", fontSize: "12px", background: "#1A1826", padding: "8px 12px", borderRadius: "8px", border: "1px solid #2E2A42" }}>{t("premium_required")}</div>
                )}
              </div>
              {communitiesForSection.length === 0 ? (
                <div style={{ color: "#635E80", textAlign: "center", padding: "40px", background: "#1A1826", borderRadius: "12px" }}>{t("no_communities")}</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                  {communitiesForSection.map((community) => {
                    const status = myMembershipStatus(community.id);
                    const isOwner = user.id === community.owner_id;
                    return (
                      <div key={community.id} style={{ background: "#1A1826", borderRadius: "14px", overflow: "hidden", border: "1px solid #2E2A42" }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}>
                        <div style={{ height: "6px", background: community.color }} />
                        <div style={{ padding: "16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                            <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: community.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold", color: "white", flexShrink: 0 }}>{community.name.charAt(0).toUpperCase()}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ color: "white", fontWeight: "bold", fontSize: "15px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{community.name}</div>
                              <div style={{ color: "#9C97B8", fontSize: "11px" }}>{communityMembersCount(community.id)} {t("members_count")} • {t("owner_label")}: {usernameFor(community.owner_id)}</div>
                            </div>
                            {community.is_private && <span>🔒</span>}
                          </div>
                          {community.description && <div style={{ color: "#9C97B8", fontSize: "13px", marginBottom: "10px", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>{community.description}</div>}
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
                            {community.game_name && <span style={{ background: "#221F32", color: "#9B6BFF", padding: "2px 8px", borderRadius: "20px", fontSize: "11px" }}>🎮 {community.game_name}</span>}
                            {community.edit_type && <span style={{ background: "#221F32", color: "#FF3D8A", padding: "2px 8px", borderRadius: "20px", fontSize: "11px" }}>🎬 {community.edit_type}</span>}
                            {community.movies_genre && <span style={{ background: "#221F32", color: "#FFC24B", padding: "2px 8px", borderRadius: "20px", fontSize: "11px" }}>🎥 {community.movies_genre}</span>}
                            {community.sport_type && <span style={{ background: "#221F32", color: "#22D3EE", padding: "2px 8px", borderRadius: "20px", fontSize: "11px" }}>⚽ {community.sport_type}</span>}
                          </div>
                          <div style={{ display: "flex", gap: "8px" }}>
                            {(isOwner || status === "approved") && <button onClick={() => setSelectedCommunity(community)} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "none", background: community.color, color: "white", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}>{t("enter_community")}</button>}
                            {!isOwner && !status && <button onClick={() => joinCommunity(community.id)} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: `1px solid ${community.color}`, background: "transparent", color: community.color, cursor: "pointer", fontSize: "13px" }}>{t("join_community")}</button>}
                            {!isOwner && status === "pending" && <div style={{ flex: 1, padding: "8px", borderRadius: "8px", background: "#221F32", color: "#9C97B8", fontSize: "12px", textAlign: "center" }}>{t("pending_approval")}</div>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===== بروفايل ===== */}
      {tab === "profile" && (() => {
        const displayedId = viewingProfileId || user.id;
        const displayedProfile = viewingProfileId ? profiles.find((p) => p.id === viewingProfileId) : myProfile;
        const displayedUsername = displayedProfile?.username || "?";
        const displayedBio = displayedProfile?.bio || "";
        const displayedAvatar = displayedProfile?.avatar_url || null;
        const displayedIsPremium = !!displayedProfile?.is_premium;
        const postCount = posts.filter((p) => p.user_id === displayedId).length;
        const videoCount = videos.filter((v) => v.user_id === displayedId).length;
        const messageCount = messages.filter((m) => m.user_id === displayedId).length;
        return (
          <div style={{ maxWidth: "500px" }}>
            {viewingProfileId !== null && <button onClick={() => setViewingProfileId(null)} style={{ background: "transparent", border: "none", color: "#9B6BFF", cursor: "pointer", fontSize: "13px", marginBottom: "16px", padding: 0 }}>{t("back_to_my_profile")}</button>}
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "16px" }}>
              {viewingProfileId === null ? (
                <label style={{ cursor: "pointer", position: "relative", display: "block" }}>
                  <Avatar name={displayedUsername} avatarUrl={displayedAvatar} size={80} />
                  <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) handleAvatarChange(e.target.files[0]); }} style={{ display: "none" }} />
                  {uploadingAvatar && <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "11px" }}>...</div>}
                </label>
              ) : <Avatar name={displayedUsername} avatarUrl={displayedAvatar} size={80} />}
              <div style={{ display: "flex", flex: 1 }}>
                {[{ val: postCount, label: t("stat_posts") }, { val: videoCount, label: t("stat_videos") }, { val: messageCount, label: t("stat_messages") }].map((s) => (
                  <div key={s.label} style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ color: "white", fontWeight: "bold", fontSize: "18px" }}>{s.val}</div>
                    <div style={{ color: "#9C97B8", fontSize: "12px" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            {viewingProfileId === null && !showSettings && <div style={{ color: "#635E80", fontSize: "11px", marginBottom: "10px" }}>{t("tap_photo_to_change")}</div>}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <div style={{ color: "white", fontWeight: "bold", fontSize: "16px" }}>{displayedUsername}</div>
              {displayedIsPremium && <span>💎</span>}
            </div>
            {viewingProfileId === null && !editingProfile && !showSettings && (
              <>
                <div style={{ color: "#9C97B8", fontSize: "14px", marginBottom: "14px" }}>{displayedBio || t("no_bio")}</div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => { setEditingProfile(true); setShowSettings(false); }} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid #2E2A42", background: "transparent", color: "white", cursor: "pointer", fontSize: "13px" }}>{t("edit_profile_button")}</button>
                  <button onClick={() => { setShowSettings(true); setEditingProfile(false); }} style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #2E2A42", background: "transparent", color: "#9C97B8", cursor: "pointer", fontSize: "13px" }}>⚙</button>
                </div>
              </>
            )}
            {viewingProfileId === null && editingProfile && (
              <div style={{ background: "#1A1826", border: "1px solid #2E2A42", borderRadius: "12px", padding: "16px", marginTop: "10px" }}>
                <div style={{ color: "#9C97B8", fontSize: "13px", marginBottom: "6px" }}>{t("username_label")}</div>
                <input value={profileUsernameDraft} onChange={(e) => setProfileUsernameDraft(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #2E2A42", background: "#100F17", color: "white", marginBottom: "14px" }} />
                <div style={{ color: "#9C97B8", fontSize: "13px", marginBottom: "6px" }}>{t("bio_label")}</div>
                <textarea value={profileBioDraft} onChange={(e) => setProfileBioDraft(e.target.value)} rows={3} placeholder={t("bio_placeholder")} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #2E2A42", background: "#100F17", color: "white", marginBottom: "10px", fontFamily: "inherit" }} />
                {profileSaveError && <div style={{ color: "#FF3D8A", fontSize: "13px", marginBottom: "10px" }}>{profileSaveError}</div>}
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={async () => { const ok = await updateMyProfile(); if (ok) setEditingProfile(false); }} disabled={savingProfile} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: "#9B6BFF", color: "#0A0910", cursor: "pointer", opacity: savingProfile ? 0.6 : 1 }}>{savingProfile ? t("saving") : t("save")}</button>
                  <button onClick={() => setEditingProfile(false)} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #2E2A42", background: "transparent", color: "white", cursor: "pointer" }}>{t("cancel")}</button>
                </div>
              </div>
            )}
            {viewingProfileId === null && showSettings && (
              <div style={{ background: "#1A1826", border: "1px solid #2E2A42", borderRadius: "12px", padding: "16px", marginTop: "10px" }}>
                <button onClick={() => { setShowSettings(false); setConfirmingDelete(false); }} style={{ background: "transparent", border: "none", color: "#9B6BFF", cursor: "pointer", fontSize: "13px", marginBottom: "16px", padding: 0 }}>{t("back")}</button>
                <div style={{ borderBottom: "1px solid #2E2A42", paddingBottom: "16px", marginBottom: "16px" }}>
                  <div style={{ color: "white", fontWeight: "bold", fontSize: "15px", marginBottom: "10px" }}>{t("language_label")}</div>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                    {(["ar", "en", "fr"] as Lang[]).map((lang) => (
                      <button key={lang} onClick={() => changeLanguage(lang)} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: language === lang ? "1px solid #9B6BFF" : "1px solid #2E2A42", background: language === lang ? "#2A2340" : "transparent", color: "white", cursor: "pointer", fontSize: "13px" }}>
                        {lang === "ar" ? "العربية" : lang === "en" ? "English" : "Français"}
                      </button>
                    ))}
                  </div>
                  <div style={{ color: "white", fontWeight: "bold", fontSize: "15px", marginBottom: "6px" }}>{t("premium_settings_title")}</div>
                  <div style={{ color: "#9C97B8", fontSize: "12px", marginBottom: "10px" }}>{t("premium_settings_desc")}</div>
                  <button onClick={togglePremium} style={{ padding: "8px 16px", borderRadius: "8px", border: myProfile.is_premium ? "1px solid #FF3D8A" : "none", background: myProfile.is_premium ? "transparent" : "#9B6BFF", color: myProfile.is_premium ? "#FF3D8A" : "#0A0910", cursor: "pointer", fontSize: "13px" }}>
                    {myProfile.is_premium ? t("deactivate_premium_button") : t("activate_premium_button")}
                  </button>
                </div>
                <div style={{ color: "white", fontWeight: "bold", fontSize: "15px", marginBottom: "10px" }}>{t("change_password_title")}</div>
                <input type="password" value={newPasswordDraft} onChange={(e) => setNewPasswordDraft(e.target.value)} placeholder={t("new_password_placeholder")} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #2E2A42", background: "#100F17", color: "white", marginBottom: "8px" }} />
                {passwordChangeMsg && <div style={{ color: passwordChangeMsg.includes("✓") ? "#4ADE80" : "#FF3D8A", fontSize: "13px", marginBottom: "8px" }}>{passwordChangeMsg}</div>}
                <button onClick={changePassword} disabled={changingPassword} style={{ padding: "8px 16px", borderRadius: "8px", border: "none", background: "#9B6BFF", color: "#0A0910", cursor: "pointer", fontSize: "13px", marginBottom: "22px", opacity: changingPassword ? 0.6 : 1 }}>{changingPassword ? "..." : t("save_password_button")}</button>
                <div style={{ color: "white", fontWeight: "bold", fontSize: "15px", marginBottom: "10px" }}>{t("change_email_title")}</div>
                <input type="email" value={newEmailDraft} onChange={(e) => setNewEmailDraft(e.target.value)} placeholder={t("new_email_placeholder")} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #2E2A42", background: "#100F17", color: "white", marginBottom: "8px" }} />
                {emailChangeMsg && <div style={{ color: emailChangeMsg.includes("✓") ? "#4ADE80" : "#FF3D8A", fontSize: "13px", marginBottom: "8px" }}>{emailChangeMsg}</div>}
                <button onClick={changeEmail} disabled={changingEmail} style={{ padding: "8px 16px", borderRadius: "8px", border: "none", background: "#9B6BFF", color: "#0A0910", cursor: "pointer", fontSize: "13px", marginBottom: "26px", opacity: changingEmail ? 0.6 : 1 }}>{changingEmail ? "..." : t("save_email_button")}</button>
                <div style={{ borderTop: "1px solid #2E2A42", paddingTop: "16px" }}>
                  <div style={{ color: "#FF3D8A", fontWeight: "bold", fontSize: "15px", marginBottom: "8px" }}>{t("delete_account_title")}</div>
                  {!confirmingDelete ? (
                    <><div style={{ color: "#9C97B8", fontSize: "13px", marginBottom: "10px" }}>{t("delete_account_warning")}</div><button onClick={() => setConfirmingDelete(true)} style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #FF3D8A", background: "transparent", color: "#FF3D8A", cursor: "pointer", fontSize: "13px" }}>{t("delete_account_title")}</button></>
                  ) : (
                    <><div style={{ color: "#FF3D8A", fontSize: "13px", marginBottom: "10px", fontWeight: "bold" }}>{t("delete_confirm_warning")}</div><div style={{ display: "flex", gap: "8px" }}><button onClick={deleteAccount} disabled={deletingAccount} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: "#FF3D8A", color: "white", cursor: "pointer", opacity: deletingAccount ? 0.6 : 1 }}>{deletingAccount ? t("deleting") : t("delete_confirm_button")}</button><button onClick={() => setConfirmingDelete(false)} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #2E2A42", background: "transparent", color: "white", cursor: "pointer" }}>{t("cancel")}</button></div></>
                  )}
                </div>
              </div>
            )}
            {viewingProfileId !== null && (
              <>
                <div style={{ color: "#9C97B8", fontSize: "14px", marginBottom: "12px" }}>{displayedBio || t("no_bio")}</div>
                <button onClick={() => { setActiveDmUserId(viewingProfileId); setDmPanelOpen(true); }} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "none", background: "#9B6BFF", color: "#0A0910", cursor: "pointer", fontSize: "13px" }}>{t("send_message_button")}</button>
              </>
            )}
          </div>
        );
      })()}

      {/* ===== زر الرسائل العائم ===== */}
      <div onClick={() => { setDmPanelOpen(!dmPanelOpen); if (!dmPanelOpen) setActiveDmUserId(null); }}
        style={{ position: "fixed", bottom: "28px", left: "28px", width: "58px", height: "58px", borderRadius: "50%", background: "linear-gradient(135deg, #9B6BFF 0%, #FF3D8A 100%)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 24px rgba(155,107,255,0.45)", zIndex: 1000, transition: "transform 0.2s ease" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1.1)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1)"; }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        {unreadDmCount > 0 && <div style={{ position: "absolute", top: "2px", right: "2px", width: "18px", height: "18px", borderRadius: "50%", background: "#FF3D8A", color: "white", fontSize: "10px", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #100F17" }}>{unreadDmCount > 9 ? "9+" : unreadDmCount}</div>}
      </div>

      {/* ===== لوحة الرسائل ===== */}
      <div style={{ position: "fixed", bottom: "0", left: "0", width: "360px", height: dmPanelOpen ? "100vh" : "0", background: "#13111E", borderRight: "1px solid #1E1B2E", zIndex: 999, overflow: "hidden", transition: "height 0.35s cubic-bezier(0.4,0,0.2,1)", display: "flex", flexDirection: "column", boxShadow: dmPanelOpen ? "4px 0 40px rgba(0,0,0,0.6)" : "none" }}>
        {dmPanelOpen && (
          <>
            {activeDmUserId === null && (
              <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ padding: "20px 18px 14px", borderBottom: "1px solid #1E1B2E", background: "#0F0D1A" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #9B6BFF, #FF3D8A)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                      </div>
                      <span style={{ color: "white", fontWeight: "700", fontSize: "17px" }}>{t("private_messages_title")}</span>
                    </div>
                    <button onClick={() => setDmPanelOpen(false)} style={{ background: "#1E1B2E", border: "none", color: "#9C97B8", cursor: "pointer", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>✕</button>
                  </div>
                  <div style={{ position: "relative" }}>
                    <svg style={{ position: "absolute", top: "50%", left: "12px", transform: "translateY(-50%)", opacity: 0.4 }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9C97B8" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <input value={dmSearch} onChange={(e) => setDmSearch(e.target.value)} placeholder={t("search_placeholder")} style={{ width: "100%", padding: "9px 12px 9px 36px", borderRadius: "12px", border: "1px solid #1E1B2E", background: "#1A1726", color: "white", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
                  {filteredPartners().length === 0 && <div style={{ color: "#635E80", fontSize: "13px", textAlign: "center", marginTop: "40px", padding: "0 20px" }}>{dmSearch ? t("messages_empty_search") : t("no_dm_yet")}</div>}
                  {filteredPartners().map((otherId) => {
                    const last = lastDmWith(otherId);
                    return (
                      <div key={otherId} onClick={() => setActiveDmUserId(otherId)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 18px", cursor: "pointer" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#1A1726")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <div style={{ position: "relative", flexShrink: 0 }}>
                          <Avatar name={usernameFor(otherId)} avatarUrl={avatarUrlFor(otherId)} size={46} />
                          <div style={{ position: "absolute", bottom: "1px", right: "1px", width: "12px", height: "12px", borderRadius: "50%", background: "#4ADE80", border: "2px solid #13111E" }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                              <span style={{ color: "white", fontWeight: "600", fontSize: "14px" }}>{usernameFor(otherId)}</span>
                              {isPremiumUser(otherId) && <span style={{ fontSize: "11px" }}>💎</span>}
                            </div>
                            {last?.created_at && <span style={{ color: "#635E80", fontSize: "11px" }}>{timeAgo(last.created_at)}</span>}
                          </div>
                          <div style={{ color: "#9C97B8", fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{last?.text || "..."}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {activeDmUserId !== null && (
              <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ padding: "14px 16px", borderBottom: "1px solid #1E1B2E", background: "#0F0D1A", display: "flex", alignItems: "center", gap: "12px" }}>
                  <button onClick={() => setActiveDmUserId(null)} style={{ background: "#1E1B2E", border: "none", color: "#9C97B8", cursor: "pointer", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                  </button>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <Avatar name={usernameFor(activeDmUserId)} avatarUrl={avatarUrlFor(activeDmUserId)} size={38} />
                    <div style={{ position: "absolute", bottom: "1px", right: "1px", width: "10px", height: "10px", borderRadius: "50%", background: "#4ADE80", border: "2px solid #0F0D1A" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <span style={{ color: "white", fontWeight: "600", fontSize: "14px" }}>{usernameFor(activeDmUserId)}</span>
                      {isPremiumUser(activeDmUserId) && <span style={{ fontSize: "11px" }}>💎</span>}
                    </div>
                    <div style={{ color: "#4ADE80", fontSize: "11px" }}>Online</div>
                  </div>
                  <button onClick={() => setDmPanelOpen(false)} style={{ background: "#1E1B2E", border: "none", color: "#9C97B8", cursor: "pointer", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {dmThreadWith(activeDmUserId).length === 0 && <div style={{ color: "#635E80", fontSize: "13px", textAlign: "center", marginTop: "40px" }}>{t("start_conversation")}</div>}
                  {dmThreadWith(activeDmUserId).map((m) => {
                    const isMine = m.sender_id === user.id;
                    return (
                      <div key={m.id} style={{ display: "flex", flexDirection: isMine ? "row-reverse" : "row", alignItems: "flex-end", gap: "8px" }}>
                        {!isMine && <Avatar name={usernameFor(m.sender_id)} avatarUrl={avatarUrlFor(m.sender_id)} size={28} />}
                        <div style={{ background: isMine ? "linear-gradient(135deg, #9B6BFF, #7B4FCC)" : "#1E1B2E", color: "white", padding: "10px 14px", borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px", fontSize: "14px", maxWidth: "75%", lineHeight: "1.4", boxShadow: isMine ? "0 2px 12px rgba(155,107,255,0.3)" : "none" }}>
                          {m.text}
                          <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", marginTop: "4px", textAlign: isMine ? "left" : "right" }}>{timeAgo(m.created_at)}</div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={dmMessagesEndRef} />
                </div>
                <div style={{ padding: "12px 14px", borderTop: "1px solid #1E1B2E", background: "#0F0D1A", display: "flex", gap: "10px", alignItems: "center" }}>
                  <input value={newDmText} onChange={(e) => setNewDmText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendDirectMessage()} placeholder={t("type_message_placeholder")} style={{ flex: 1, padding: "10px 14px", borderRadius: "24px", border: "1px solid #1E1B2E", background: "#1A1726", color: "white", fontSize: "14px", outline: "none" }} />
                  <button onClick={sendDirectMessage} disabled={sendingDm || !newDmText.trim()} style={{ width: "42px", height: "42px", borderRadius: "50%", border: "none", background: newDmText.trim() ? "linear-gradient(135deg, #9B6BFF, #FF3D8A)" : "#1E1B2E", color: "white", cursor: newDmText.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s", opacity: sendingDm ? 0.6 : 1 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
