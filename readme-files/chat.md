# بخش چت در دوره‌ها — مستندات فنی و ارائه

---

## ۱. مرور کلی سیستم چت (System Overview)

سیستم چت در دوره‌ها یک **پیام‌رسان لحظه‌ای (Real-time Messenger)** است که به دانشجویان، مدرسان و مدیران اجازه می‌دهد در هر دوره یک فضای گفتگوی اختصاصی داشته باشند. این سیستم به‌صورت کامل توسط تیم پروژه طراحی و پیاده‌سازی شده و از الگوی **Event-Driven Architecture** با پروتکل **Server-Sent Events (SSE)** استفاده می‌کند.

### قابلیت‌های اصلی:
- ارسال پیام متنی و فایل پیوست
- پاسخ به پیام‌ها (Reply)
- واکنش‌های ایموجی (Emoji Reactions)
- نشانگر تایپ کردن (Typing Indicator)
- وضعیت خواندن پیام‌ها (Read Receipts / Double Check)
- نظرسنجی زنده (Live Polls)
- حذف پیام
- لیست اعضا با وضعیت آنلاین
- جستجوی گفتگوها
- پیگیری پیام‌های خوانده‌نشده (Unread Badge)
- بارگذاری پیام‌های قدیمی‌تر (Infinite Scroll / Lazy Loading)
- رابط کاربری واکنش‌گرا (Responsive) با پشتیبانی RTL

---

## ۲. معماری سیستم (Architecture)

### ۲.۱ لایه‌بندی (Layering)

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (React)                    │
│  ChatProvider (Context) ─► ChatPage ─► ChatWindow        │
│         │                                       │        │
│    EventSource (SSE)                     REST API calls  │
└─────────┼───────────────────────────────────────┼────────┘
          │                                       │
          ▼                                       ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend (NestJS)                        │
│  ChatController ─► ChatService ─► Prisma (SQL Server)   │
│       ▲                   │                              │
│       │          ChatEventsService (In-Memory Hub)       │
│       └───────────────────┘                              │
└─────────────────────────────────────────────────────────┘
```

### ۲.۲ الگوی ارتباطی

سیستم از ترکیب دو الگوی ارتباطی استفاده می‌کند:

| پروتکل | کاربرد | مسیر |
|--------|--------|------|
| **REST API (HTTP)** | عملیات CRUD: ارسال پیام، دریافت لیست، حذف، واکنش، رأی | `POST/GET/DELETE /chat/*` |
| **SSE (Server-Sent Events)** | پیام‌های لحظه‌ای: پیام جدید، تایپ، خواندن، واکنش، نظرسنجی | `GET /chat/events?token=` |

**چرا SSE به جای WebSocket؟**
- SSE یک‌طرفه است (Server → Client) و برای چت که عملیات نوشتن از طریق REST انجام می‌شود، کافی است.
- EventSource در مرورگر به‌صورت خودکار **Reconnect** می‌کند.
- نیاز به کتابخانه اضافی (مثل Socket.IO) ندارد.
- ساده‌تر از WebSocket است و از HTTP عادی استفاده می‌کند.

### ۲.۳ مدل داده‌ای (Database Schema - Prisma/SQL Server)

مدل‌های مرتبط با چت در SQL Server:

```prisma
// جدول پیام‌ها
model ChatMessages {
  Id              Int        @id @default(autoincrement())
  Course_Id       Int        // دوره مربوطه
  Sender_Id       Int        // فرستنده پیام
  Content         String?    // متن پیام
  AttachmentUrl   String?    // آدرس فایل پیوست
  AttachmentName  String?    // نام فایل
  AttachmentType  String?    // MIME type فایل
  AttachmentSize  BigInt?    // حجم فایل
  ReplyTo_Id      Int?       // آی‌دی پیامی که به آن پاسخ داده می‌شود
  CreatedAt       DateTime   @default(now())
  // روابط
  Courses         Courses    @relation(...)
  Sender          Users      @relation(...)
  ReplyTo         ChatMessages? @relation("ChatMessageReplies")
  Replies         ChatMessages[] @relation("ChatMessageReplies")
  Reactions       ChatMessageReactions[]
}

// جدول واکنش‌ها (toggle: هر کاربر فقط یک واکنش روی هر پیام)
model ChatMessageReactions {
  Id          Int          @id @default(autoincrement())
  Message_Id  Int
  User_Id     Int
  Reaction    String       @db.NVarChar(10)    // ایموجی
  CreatedAt   DateTime     @default(now())
  // unique: (Message_Id, User_Id)
}

// جدول وضعیت خواندن
model ChatReads {
  Id                 Int      @id @default(autoincrement())
  User_Id            Int
  Course_Id          Int
  LastReadMessage_Id Int      // آخرین پیام خوانده‌شده
  UpdatedAt          DateTime @default(now())
  // unique: (User_Id, Course_Id)
}

// جدول نظرسنجی‌ها
model ChatPolls {
  Id         Int              @id @default(autoincrement())
  Course_Id  Int
  Creator_Id Int
  Question   String           @db.NVarChar(300)
  IsActive   Boolean          @default(true)
  CreatedAt  DateTime         @default(now())
  Options    ChatPollOptions[]
}

// گزینه‌های نظرسنجی
model ChatPollOptions {
  Id         Int             @id @default(autoincrement())
  Poll_Id    Int
  OptionText String          @db.NVarChar(150)
  Votes      ChatPollVotes[]
}

// آرای نظرسنجی
model ChatPollVotes {
  Id          Int              @id @default(autoincrement())
  Option_Id   Int
  User_Id     Int
  CreatedAt   DateTime         @default(now())
  // unique: (Option_Id, User_Id)
}
```

---

## ۳. بک‌اند (Backend) — NestJS

### ۳.۱ ساختار ماژول

```
backend/src/chat/
├── chat.module.ts            // تعریف ماژول NestJS
├── chat.controller.ts        // کنترلر REST + SSE endpoint
├── chat.service.ts           // منطق تجاری اصلی
├── chat.events.service.ts    // هاب لحظه‌ای (In-Memory SSE Hub)
├── dto/
│   ├── send-message.dto.ts
│   ├── mark-read.dto.ts
│   ├── typing.dto.ts
│   ├── react-message.dto.ts
│   ├── create-poll.dto.ts
│   └── vote-poll.dto.ts
└── guards/
    └── sse-auth.guard.ts     // Guard احراز هویت SSE
```

### ۳.۲ ChatEventsService — هاب لحظه‌ای

این سرویس قلب سیستم لحظه‌ای است و در حافظه (In-Memory) اجرا می‌شود:

```typescript
@Injectable()
export class ChatEventsService {
  // نقشه‌ای از userId → مجموعه Subject‌های RxJS
  private connections = new Map<number, Set<Subject<any>>>();
  private onlineUsers = new Set<number>();

  subscribe(userId: number): Observable<any> {
    const subject = new Subject<any>();
    // هر کاربر می‌تواند چند تب/اتصال فعال داشته باشد
    let subs = this.connections.get(userId);
    if (!subs) { subs = new Set(); this.connections.set(userId, subs); }
    subs.add(subject);
    this.onlineUsers.add(userId);
    // هنگام قطع اتصال، Subject حذف می‌شود
    return subject.asObservable().pipe(
      finalize(() => {
        subs.delete(subject);
        if (subs.size === 0) {
          this.connections.delete(userId);
          this.onlineUsers.delete(userId);
        }
      }),
    );
  }

  emitToUsers(userIds: number[], type: string, data: unknown) {
    for (const id of userIds) {
      const subs = this.connections.get(id);
      if (!subs) continue;
      for (const s of subs) s.next({ type, data });
    }
  }
}
```

**نکات فنی مهم:**
- از **RxJS Subject** برای مدیریت جریان داده استفاده می‌شود.
- هر کاربر می‌تواند چندین **Subject** داشته باشد (مثلاً چند تب مرورگر).
- `finalize()` وقتی اتصال قطع شود، تمیزکاری (Cleanup) را انجام می‌دهد.
- **المان آنلاین** از طریق مجموعه `onlineUsers` ردیابی می‌شود.

### ۳.۳ SSE Auth Guard

از آنجایی که `EventSource` در مرورگر نمی‌تواند هدر `Authorization` بفرستد، توکن JWT از طریق **query parameter** ارسال می‌شود:

```
GET /chat/events?token=eyJhbGciOiJIUzI1NiIs...
```

Guard توکن را از query string یا header استخراج و اعتبارسنجی می‌کند.

### ۳.۴ ChatService — منطق تجاری

#### کنترل دسترسی (Access Control)
```typescript
private async assertAccess(user, courseId) {
  if (user.roleId === 3) return;  // Admin → دسترسی به همه
  if (user.roleId === 2) {
    // Teacher → فقط دوره‌های خودش
    if (course.Teacher_Id !== user.id) throw ForbiddenException;
    return;
  }
  // Student → فقط دوره‌هایی که در آن ثبت‌نام کرده
  const enrollment = await prisma.enrollments.findFirst({
    where: { Course_Id: courseId, Student_Id: user.id }
  });
  if (!enrollment) throw ForbiddenException;
}
```

#### سه نقش کاربری (RBAC):
| نقش | Role_Id | دسترسی چت |
|-----|---------|-----------|
| دانشجو (Student) | 1 | فقط دوره‌های ثبت‌نام‌شده |
| مدرس (Instructor) | 2 | دوره‌های خودش + ایجاد نظرسنجی |
| مدیر (Admin) | 3 | همه دوره‌ها + حذف هر پیام + ایجاد نظرسنجی |

#### ارسال پیام
```typescript
async sendMessage(user, courseId, dto) {
  await this.assertAccess(user, courseId);
  // ذخیره در دیتابیس
  const message = await prisma.chatMessages.create({ data: { ... } });
  // آپدیت وضعیت خواندن فرستنده
  await this.upsertRead(user.id, courseId, message.Id);
  // ارسال لحظه‌ای به همه شرکت‌کنندگان
  const participants = await this.getParticipantIds(courseId);
  this.events.emitToUsers(participants, 'new-message', { courseId, message });
  return message;
}
```

#### واکنش (Toggle Reaction)
هر کاربر فقط می‌تواند **یک واکنش** روی هر پیام داشته باشد. اگر همان ایموجی را دوباره بزند، واکنش **حذف** (Toggle Off) می‌شود.

#### نظرسنجی (Poll)
- فقط مدرس یا مدیر می‌تواند ایجاد کند.
- هر کاربر فقط یک رأی دارد اما می‌تواند رأی خود را **تغییر** دهد.
- نتایج به‌صورت **درصد و تعداد** نمایش داده می‌شود.
- رأی‌ها به‌صورت **لحظه‌ای** برای همه شرکت‌کنندگان آپدیت می‌شود.

### ۳.۵ REST API Endpoints

| متد | مسیر | توضیح |
|-----|------|-------|
| `GET` | `/chat/events?token=` | اتصال SSE لحظه‌ای |
| `GET` | `/chat/courses` | لیست گفتگوهای کاربر |
| `GET` | `/chat/courses/:id/messages` | پیام‌های یک دوره (صفحه‌بندی) |
| `GET` | `/chat/courses/:id/members` | لیست اعضا + وضعیت آنلاین |
| `POST` | `/chat/courses/:id/messages` | ارسال پیام |
| `DELETE` | `/chat/messages/:id` | حذف پیام |
| `POST` | `/chat/courses/:id/read` | علامت خواندن |
| `POST` | `/chat/courses/:id/typing` | نشانگر تایپ |
| `POST` | `/chat/messages/:id/reaction` | واکنش ایموجی |
| `GET` | `/chat/courses/:id/polls` | لیست نظرسنجی‌ها |
| `POST` | `/chat/courses/:id/polls` | ایجاد نظرسنجی |
| `POST` | `/chat/polls/:id/vote` | رأی دادن |

### ۳.۶ اعتبارسنجی داده‌ها (DTO Validation)

از کتابخانه **class-validator** و **class-transformer** استفاده شده:

```typescript
// SendMessageDto
@IsOptional() @IsString() @MaxLength(4000) content?: string;
@IsOptional() @IsString() @MaxLength(500)  attachmentUrl?: string;

// ReactMessageDto
@IsIn(['👍', '❤️', '😮', '😂', '😢', '🎉'])
reaction: string;

// CreatePollDto
@IsString() @MinLength(1) @MaxLength(300) question: string;
@IsArray() @ArrayMinSize(2) @ArrayMaxSize(6) options: string[];
```

---

## ۴. فرانت‌اند (Frontend) — React

### ۴.۱ ساختار فایل‌ها

```
FrontEnd/src/
├── core/common/chat/
│   └── chatContext.tsx         // Context لحظه‌ای + اتصال SSE
├── feature-module/chat/
│   ├── chat.tsx                // صفحه اصلی چت
│   └── chat.scss               // استایل‌ها
└── services/
    └── chat.service.ts         // سرویس API (REST calls)
```

### ۴.۲ ChatProvider — مدیریت State لحظه‌ای

```tsx
export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState(null);
  const [unread, setUnread] = useState({});
  const [lastMessages, setLastMessages] = useState({});
  const [typing, setTyping] = useState({});
  const [readState, setReadState] = useState({});
  const [connected, setConnected] = useState(false);
  // ...
};
```

**این Provider در لایه بالایی برنامه قرار می‌گیرد** و تمام state‌های لحظه‌ای چت را مدیریت می‌کند.

### ۴.۳ اتصال SSE

```typescript
useEffect(() => {
  const token = localStorage.getItem("accessToken");
  const es = new EventSource(
    `${api_base_url}/chat/events?token=${encodeURIComponent(token)}`
  );

  // ثبت listener برای هر نوع رویداد
  es.addEventListener("new-message", (e) => { ... });
  es.addEventListener("typing",       (e) => { ... });
  es.addEventListener("read",         (e) => { ... });
  es.addEventListener("reaction",     (e) => { ... });
  es.addEventListener("new-poll",     (e) => { ... });
  es.addEventListener("poll-vote",    (e) => { ... });
  es.addEventListener("message-deleted", (e) => { ... });
  es.addEventListener("ping",         () => undefined);  // Heartbeat

  // بازاتصال خودکار هنگام رفرش توکن
  const interval = setInterval(() => {
    const current = localStorage.getItem("accessToken");
    if (current && current !== tokenRef) {
      es.close();
      connect();  // اتصال مجدد با توکن جدید
    }
  }, 30000);
}, [myId, handleEvent]);
```

**نکات مهم:**
- **Heartbeat (Ping)** هر ۲۵ ثانیه از سرور ارسال می‌شود تا پروکسی‌ها اتصال را قطع نکنند.
- **Token Refresh** هر ۳۰ ثانیه بررسی می‌شود و در صورت تغییر، SSE مجدداً وصل می‌شود.
- **Auto-Reconnect** توسط `EventSource` به‌صورت خودکار انجام می‌شود.

### ۴.۴ جداسازی نگرانی‌ها (Separation of Concerns)

| لایه | مسئولیت |
|------|---------|
| `ChatProvider` | State سراسری، اتصال SSE، تایمر تایپ، unread badge |
| `ChatPage` | مدیریت صفحه، انتخاب دوره، بارگذاری اولیه |
| `ChatWindow` | رندر هدر، پیام‌ها، compose bar |
| `MessageBubble` | رندر تک‌پیام، واکنش‌ها، حذف، پاسخ |
| `PollCard` | رندر نظرسنجی و رأی‌دهی |
| `chatService.ts` | فراخوانی‌های REST API |

### ۴.۵ قابلیت‌های پیشرفته UI

#### پیام‌های گروه‌شده (Message Grouping)
پیام‌های متوالی از یک فرستنده که کمتر از **۵ دقیقه** فاصله دارند، گروه‌بندی می‌شوند و آواتار فقط در **اولین پیام** هر گروه نمایش داده می‌شود.

#### جداساز روز (Day Separator)
تاریخ امروز → «امروز»، دیروز → «دیروز»، سایر → تاریخ کامل فارسی.

#### بارگذاری بی‌نهایت (Infinite Scroll)
هنگام اسکرول به بالا، پیام‌های قدیمی‌تر بارگذاری می‌شوند. **Scroll Position** حفظ می‌شود تا کاربر جای خود را از دست ندهد.

#### واکنش‌ها (Emoji Reactions)
واکنش‌ها به‌صورت **گروه‌شده** نمایش داده می‌شوند (مثلاً 👍 × 3). با کلیک مجدد، واکنش **toggle** می‌شود.

#### وضعیت خواندن (Read Receipts)
- **تیک تک** (✓✓) آبی = پیام توسط دیگران خوانده شده
- **تیک تک** (✓✓) خاکستری = ارسال شده ولی هنوز خوانده نشده

#### نشانگر تایپ (Typing Indicator)
با فاصله **۲.۵ ثانیه** بین هر event تایپ ارسال می‌شود (debounce). اگر کاربر **۶ ثانیه** تایپ نکند، نشانگر به‌صورت خودکار ناپدید می‌شود.

#### آواتار با Initials
اگر کاربر عکس پروفایل نداشته باشد یا عکس بارگذاری نشود، یک آواتار رنگی با **حروف اول نام** نمایش داده می‌شود (الگوی تلگرام). رنگ بر اساس hash نام کاربر انتخاب می‌شود.

### ۴.۶ آپلود فایل

- حداکثر حجم: **۵۰ مگابایت**
- فایل ابتدا به سرور آپلود شده، سسپس URL آن در پیام قرار می‌گیرد.
- تصاویر به‌صورت **پیش‌نمایش** در چت نمایش داده می‌شوند.
- سایر فایل‌ها با **آیکون مناسب** (PDF, Word, Excel, ZIP و...) نمایش داده می‌شوند.

---

## ۵. رویدادهای لحظه‌ای (Real-time Events)

| رویداد | جهت | توضیح |
|--------|-----|-------|
| `new-message` | Server → Client | پیام جدید دریافت شد |
| `message-deleted` | Server → Client | یک پیام حذف شد |
| `typing` | Server → Client | کاربری در حال تایپ است |
| `read` | Server → Client | کاربری پیام‌ها را خواند |
| `reaction` | Server → Client | واکنش روی پیام تغییر کرد |
| `new-poll` | Server → Client | نظرسنجی جدید ایجاد شد |
| `poll-vote` | Server → Client | رأی جدید ثبت شد |
| `ping` | Server → Client | Heartbeat (هر ۲۵ ثانیه) |

---

## ۶. فلوی داده‌ها (Data Flow)

### ارسال پیام:
```
کاربر Enter می‌زند
  → handleSend()
    → chatService.sendMessage() [POST /chat/courses/:id/messages]
      → ChatService.assertAccess() بررسی دسترسی
      → Prisma: chatMessages.create()
      → Prisma: chatReads.upsert() (فرستنده خوانده)
      → ChatEventsService.emitToUsers() به همه شرکت‌کنندگان
        → EventSource در مرورگر هر کاربر → onMessage listener
          → setMessages([...prev, newMessage])
          → scrollToBottom()
```

### دریافت پیام:
```
EventSource رویداد "new-message" دریافت می‌کند
  → handleEvent({ type: "new-message", data })
    → اگر فرستنده خودم نیست:
        → setLastMessages() آپدیت لیست گفتگو
        → اگر چت باز نیست: setUnread(+1) + toast notification
    → اگر فرستنده خودم هست:
        → setLastMessages() آپدیت لیست گفتگو
    → forward به ChatPage listener
        → setMessages([...prev, message])
        → markReadSafe() + scrollToBottom()
```

---

## ۷. امنیت (Security)

1. **احراز هویت JWT**: تمام API endpoints با `JwtAuthGuard` محافظت می‌شوند.
2. **SSE Auth**: توکن JWT از query parameter خوانده و اعتبارسنجی می‌شود.
3. **کنترل دسترسی سطح دوره**: هر کاربر فقط به دوره‌هایی دسترسی دارد که مجاز است.
4. **RBAC**: سطوح دسترسی متفاوت برای دانشجو، مدرس و مدیر.
5. **پاکسازی توکن**: توکن‌ها در query string ارسال می‌شوند ولی در logs ثبت نمی‌شوند.
6. **محدودیت حجم فایل**: حداکثر ۵۰ مگابایت.
7. **محدودیت طول متن**: حداکثر ۴۰۰۰ کاراکتر.
8. **Validation**: تمام ورودی‌ها توسط DTOها و class-validator اعتبارسنجی می‌شوند.

---

## ۸. بهینه‌سازی عملکرد (Performance)

| تکنیک | توضیح |
|-------|-------|
| **Cursor-based Pagination** | پیام‌ها با `beforeId` صفحه‌بندی می‌شوند نه offset |
| **In-Memory Event Hub** | رویدادها بدون نوشتن در دیتابیس منتشر می‌شوند |
| **Select Specific Fields** | فقط فیلدهای مورد نیاز از دیتابیس خوانده می‌شوند |
| **Debounce Typing** | نشانگر تایپ حداکثر هر ۲.۵ ثانیه ارسال می‌شود |
| **Deduplication** | پیام‌های تکراری فیلتر می‌شوند (`previous.some(item => item.Id === message.Id)`) |
| **Optimistic Scroll** | اسکرول فوری با `requestAnimationFrame` |
| **Virtual Heartbeat** | Heartbeat ۲۵ ثانیه‌ای از قطع شدن اتصال توسط پروکسی جلوگیری می‌کند |
| **Lazy Loading** | پیام‌های قدیمی فقط هنگام اسکرول به بالا بارگذاری می‌شوند |

---

## ۹. جمع‌بندی

سیستم چت در دوره‌ها یکی از پیشرفته‌ترین بخش‌های پروژه است که مفاهیم مهم مهندسی نرم‌افزار را در بر می‌گیرد:

- **Architecture**: Event-Driven با ترکیب REST + SSE
- **Real-time Communication**: Server-Sent Events با RxJS
- **Database Design**: مدل‌های رابطه‌ای با Prisma ORM و SQL Server
- **Authentication & Authorization**: JWT + RBAC سه سطحی
- **State Management**: React Context + Custom Hooks
- **UI/UX**: رابط کاربری RTL واکنش‌گرا با الگوهای مدرن چت
- **Validation**: DTO Validation با class-validator
- **Performance Optimization**: Pagination, Debouncing, Lazy Loading

---

## ۱۰. سوالات احتمالی استاد و پاسخ‌ها

### سوال ۱: چرا از SSE به جای WebSocket استفاده کردید؟

**پاسخ:** SSE برای این سناریو مناسب‌تر است چون:
1. ارتباط **یک‌طرفه** است (فقط سرور به کلاینت) و عملیات نوشتن از طریق REST API انجام می‌شود.
2. `EventSource` به‌صورت **خودکار بازاتصال** (Auto-reconnect) می‌کند.
3. نیاز به کتابخانه اضافی ندارد و روی **HTTP عادی** کار می‌کند.
4. WebSocket برای چت‌های **دوطرفه همزمان** (مثل بازی آنلاین) بهتر است، ولی اینجا کافی نیست.

---

### سوال ۲: اگر سرور ریستارت شود، چه اتفاقی برای اتصال‌های SSE می‌افتد؟

**پاسخ:** اتصال‌های SSE قطع می‌شوند ولی `EventSource` در مرورگر **به‌صورت خودکار تلاش می‌کند مجدداً وصل شود**. وضعیت چت (unread، read state) در دیتابیس ذخیره شده، بنابراین پس از بازاتصال، کاربر دقیقاً از همان نقطه ادامه می‌دهد. پیام‌ها در SQL Server ذخیره هستند و از بین نمی‌روند.

---

### سوال ۳: مکانیزم Read Receipt (تیک تک) چگونه کار می‌کند؟

**پاسخ:** جدول `ChatReads` برای هر (کاربر، دوره) یک رکورد دارد که `LastReadMessage_Id` آخرین پیام خوانده‌شده را نگه می‌دارد. هنگامی که کاربر وارد چت می‌شود یا پیام جدیدی دریافت می‌کند، با فراخوانی `POST /chat/courses/:id/read` این مقدار آپدیت می‌شود. سپس `ChatReads` همه کاربران خوانده‌شده بررسی می‌شود و اگر `Id` پیام ≤ `LastReadMessage_Id` هر کاربر دیگری باشد، تیک **آبی دوتایی** نمایش داده می‌شود.

---

### سوال ۴: مکانی즘 Typing Indicator چگونه جلوی ارسال بیش از حد پیام را می‌گیرد؟

**پاسخ:** از **Debounce** استفاده می‌شود. در فرانت‌اند، نشانگر تایپ حداکثر هر **۲.۵ ثانیه** ارسال می‌شود (`typingSentAtRef`). در بک‌اند، رویداد فقط به سایر کاربران (خود فرستنده حذف می‌شود) ارسال می‌شود. در فرانت‌اند گیرنده، یک **تایمر ۶ ثانیه‌ای** وجود دارد که اگر رویداد جدیدی نیامد، نشانگر تایپ به‌صورت خودکار ناپدید می‌شود.

---

### سوال ۵: چگونه از Duplicate شدن پیام‌ها جلوگیری می‌کنید؟

**پاسخ:** از دو لایه محافظت استفاده شده:
1. **فرانت‌اند**: هنگام اضافه کردن پیام جدید، `previous.some(item => item.Id === message.Id)` بررسی می‌شود.
2. **بک‌اند**: فرستنده بلافاصله پس از ارسال، پیام را در state محلی اضافه می‌کند و `markRead` را فراخوانی می‌کند. وقتی همان پیام از SSE برمی‌گردد، از آنجا که قبلاً اضافه شده، نادیده گرفته می‌شود.

---

### سوال ۶: نقش In-Memory در ChatEventsService چیست؟ محدودیت‌های آن چیست؟

**پاسخ:** `ChatEventsService` تمام اتصال‌های فعال و وضعیت آنلاین کاربران را **در حافظه RAM** نگه می‌دارد. مزیت: سرعت بسیار بالا (بدون I/O دیتابیس). محدودیت: اگر سرور ریستارت شود، اطلاعات حافظه از بین می‌رود (ولی پیام‌ها در دیتابیس محفوظ هستند). همچنین در معماری **چند instance** (Load Balancer) نیاز به Redis یا مشابه آن دارد.

---

### سوال ۷: چطور احراز هویت SSE را حل کردید؟

**پاسخ:** `EventSource` API مرورگر قابلیت ارسال هدر `Authorization` را ندارد. بنابراین توکن JWT از طریق **query parameter** (`?token=...`) ارسال می‌شود. یک `SseAuthGuard` اختصاصی نوشته شده که توکن را از query string استخراج، verify و کاربر را از دیتابیس لود می‌کند. این Guard جایگزین `JwtAuthGuard` استاندارد شده.

---

### سوال ۸: مکانی즘 نظرسنجی زنده چگونه کار می‌کند؟

**پاسخ:**
1. مدرس/مدیر از طریق `POST /chat/courses/:id/polls` نظرسنجی ایجاد می‌کند.
2. نظرسنجی به همه شرکت‌کنندگان از طریق SSE (`new-poll`) ارسال می‌شود.
3. هر کاربر رأی می‌دهد (`POST /chat/polls/:id/vote`). رأی قبلی حذف و رأی جدید ثبت می‌شود (允许 تغییر رأی).
4. نتایج به‌صورت لحظه‌ای (`poll-vote`) برای همه آپدیت می‌شود.
5. ساختار: `ChatPolls → ChatPollOptions → ChatPollVotes` با unique constraint روی `(Option_Id, User_Id)`.

---

### سوال ۹: چگونه صفحه‌بندی پیام‌ها (Pagination) انجام می‌شود؟

**پاسخ:** از **Cursor-based Pagination** استفاده شده نه Offset-based. پارامتر `beforeId` پیام‌های قبل از یک آی‌دی خاص را برمی‌گرداند. مزیت: حتی اگر پیام جدیدی اضافه شود، صفحه‌بندی بهم نمی‌ریزد. در فرانت‌اند، هنگام اسکرول به بالا (`scrollTop < 50`)، پیام‌های قدیمی‌تر بارگذاری می‌شوند و scroll position با محاسبه `scrollHeight - previousHeight` حفظ می‌شود.

---

### سوال ۱۰: اگر کاربر همزمان در چند تب مرورگر باشد چه می‌شود؟

**پاسخ:** سیستم از آن پشتیبانی می‌کند. در `ChatEventsService`، هر `subscribe()` یک `Subject` جدید به مجموعه Subject‌های آن کاربر اضافه می‌کند. بنابراین هر تب یک اتصال SSE جداگانه دارد. هنگام بستن هر تب، فقط Subject مربوط به آن تب از طریق `finalize()` حذف می‌شود و اتصال سایر تب‌ها حفظ می‌شود.

---

### سوال ۱۱: تفاوت این چت با چت‌های آماده (مثل Socket.IO Chat) چیست؟

**پاسخ:** این سیستم **سفارشی‌سازی‌شده (Custom-built)** است و دقیقاً مطابق نیازهای پروژه طراحی شده:
- کنترل دسترسی سطح دوره (فقط اعضای دوره)
- سه نقش کاربری با سطوح دسترسی متفاوت
- یکپارچگی کامل با دیتابیس پروژه (Prisma + SQL Server)
- نظرسنجی زنده یکپارچه در چت
- رابط کاربری RTL فارسی
- بدون وابستگی به کتابخانه‌های سنگین (بدون Socket.IO)

---

### سوال ۱۲: Heartbeat چیست و چرا استفاده شده؟

**پاسخ:** Heartbeat یک بسته کوچک (ping) است که هر ۲۵ ثانیه از سرور ارسال می‌شود. هدف: جلوگیری از **قطع شدن اتصال توسط پروکسی‌ها و فایروال‌ها**. بسیاری از سرورهای واسط (مثل Nginx, AWS ALB) اگر اتصالی بیش از ۶۰ ثانیه غیرفعال باشد، آن را قطع می‌کنند. Heartbeat اتصال را زنده نگه می‌دارد.

---

### سوال ۱۳: مدل داده‌ای ChatReads چگونه از N+1 Query جلوگیری می‌کند؟

**پاسخ:** از `@@unique([User_Id, Course_Id])` روی جدول `ChatReads` استفاده شده که امکان `upsert` با کارایی بالا را فراهم می‌کند. همچنین در `getMessages()` و `getMembers()`، تمام `chatReads` یک دوره در **یک query** خوانده می‌شوند و به صورت `Map` در حافظه ساخته می‌شوند.

---

### سوال ۱۴: حذف پیام چگونه انجام می‌شود و چه کسانی می‌توانند؟

**پاسخ:** فقط **فرستنده پیام** یا **مدیر (Admin)** می‌تواند پیام را حذف کند. حذف در یک **Transaction** انجام می‌شود: ابتدا واکنش‌های مرتبط (`chatMessageReactions`) و سپس خود پیام حذف می‌شود. رویداد `message-deleted` از طریق SSE به همه شرکت‌کنندگان ارسال می‌شود و پیام از UI حذف می‌شود.

---

### سوال ۱۵: اگر بخواهید این سیستم را مقیاس‌پذیرتر کنید، چه تغییراتی می‌دهید؟

**پاسخ:**
1. **Redis Pub/Sub** به جای In-Memory برای پشتیبانی از چند instance سرور
2. **Message Queue** (مثل RabbitMQ) برای جداسازی نوشتن و خواندن
3. **WebSocket** (مثلاً Socket.IO) به جای SSE برای ارتباط دوطرفه
4. **Read State** را می‌توان با **Redis Sorted Set** بهینه‌تر کرد
5. **CDN** برای فایل‌های پیوست
6. **Rate Limiting** برای جلوگیری از spam
