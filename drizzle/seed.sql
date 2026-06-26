-- Starter job postings (idempotent). Edit or remove these in /admin once live.

INSERT INTO jobs (slug, title, team, location, employment_type, remote, summary, description, requirements, status, sort_order)
VALUES
(
  'fullstack-engineer',
  '{"zh":"全栈工程师","ja":"フルスタックエンジニア","en":"Full-Stack Engineer"}',
  'Engineering',
  '{"zh":"长沙 / 远程","ja":"長沙 / リモート","en":"Changsha / Remote"}',
  'full_time',
  true,
  '{"zh":"用 Next.js、TypeScript 与云原生技术，构建 Machi 与 Shangence 的核心产品。","ja":"Next.js・TypeScript・クラウドネイティブで Machi と Shangence のコアをつくる。","en":"Build the core of Machi and Shangence with Next.js, TypeScript and cloud-native tech."}',
  '{"zh":"你将参与智希可旗下产品从 0 到 1 的开发，覆盖前端、后端、数据库与基础设施。\n\n我们重视真实运营——你写的代码会直接服务真实用户，并和支付、后台、安全等环节连成完整的产品。","ja":"XICO のプロダクトを 0→1 で開発し、フロント・バックエンド・DB・インフラまで担当します。\n\n実運用を重視します。あなたのコードは実ユーザーに届き、決済・管理画面・セキュリティまで一つのプロダクトとしてつながります。","en":"You will build XICO products from 0 to 1 across front-end, back-end, database and infrastructure.\n\nWe value real operations — your code reaches real users and connects with payments, admin and security as one complete product."}',
  '{"zh":["扎实的 TypeScript / React 基础","熟悉后端与数据库设计","对产品体验与细节有追求","中文流利，英文或日文加分"],"ja":["確かな TypeScript / React の基礎","バックエンドと DB 設計の経験","プロダクト体験とディテールへのこだわり","中国語必須、英語または日本語は歓迎"],"en":["Solid TypeScript / React foundation","Comfortable with back-end and database design","Care for product experience and detail","Fluent Chinese; English or Japanese a plus"]}',
  'open',
  1
),
(
  'product-designer',
  '{"zh":"产品设计师","ja":"プロダクトデザイナー","en":"Product Designer"}',
  'Design',
  '{"zh":"长沙 / 远程","ja":"長沙 / リモート","en":"Changsha / Remote"}',
  'full_time',
  true,
  '{"zh":"以设计驱动的方式，定义智希可产品的品牌、界面与体验。","ja":"デザイン主導で、XICO プロダクトのブランド・UI・体験を定義する。","en":"Define the brand, interface and experience of XICO products in a design-led way."}',
  '{"zh":"你将主导产品的视觉与交互设计，从品牌到界面，把审美变成产品真正的竞争力。\n\n我们相信设计与工程同等重要，你会和工程师紧密协作，把设计落到真实可用的产品里。","ja":"プロダクトのビジュアルとインタラクション設計をリードし、ブランドから UI まで、美意識を競争力に変えます。\n\nデザインとエンジニアリングは同等に重要だと考えています。エンジニアと密に協働し、実際に使えるプロダクトへ落とし込みます。","en":"You will lead the visual and interaction design of our products — turning aesthetics into real competitive edge, from brand to interface.\n\nWe treat design and engineering as equals; you will work closely with engineers to ship design into real, usable products."}',
  '{"zh":["出色的视觉与交互设计能力","熟练使用 Figma 等工具","理解前端实现与设计系统","有完整产品设计作品集"],"ja":["優れたビジュアル / インタラクション設計力","Figma などのツールに習熟","フロント実装とデザインシステムの理解","プロダクトデザインのポートフォリオ"],"en":["Strong visual and interaction design skills","Fluent with Figma and similar tools","Understanding of front-end and design systems","A portfolio of complete product design work"]}',
  'open',
  2
)
ON CONFLICT (slug) DO NOTHING;

-- Starter blog post (idempotent).
INSERT INTO posts (slug, title, excerpt, body, tag, cover_color, status, published_at)
VALUES (
  'hello-xico',
  '{"zh":"你好，智希可","ja":"はじめまして、XICO","en":"Hello, XICO"}',
  '{"zh":"为什么我们要做一家用 AI 与设计打造产品的公司。","ja":"なぜ私たちは、AIとデザインでプロダクトをつくる会社を始めたのか。","en":"Why we started a company that builds products with AI and design."}',
  '{"zh":"智希可创立于东京与长沙，是一家用 AI 与设计打造产品的科技公司。\n\n我们相信，最好的产品诞生在工程与设计的交汇处。我们既做开发，也做创业——把精力放在自己真正相信的产品上：Machi、Shangence，以及更多正在路上的业务。\n\n这个博客，会记录我们在产品、设计、AI 与创业路上的思考与过程。","ja":"XICO は東京と長沙で創業した、AIとデザインでプロダクトをつくるテック企業です。\n\n最高のプロダクトは、エンジニアリングとデザインの交差点に生まれると信じています。私たちは開発も起業も行い、本当に信じるプロダクトに力を注ぎます——Machi、Shangence、そしてこれから生まれる事業に。\n\nこのブログでは、プロダクト・デザイン・AI・起業をめぐる私たちの思考と過程を記録していきます。","en":"XICO is a technology company founded in Tokyo and Changsha that builds products with AI and design.\n\nWe believe the best products are born at the intersection of engineering and design. We are builders and founders alike, pouring our energy into products we truly believe in — Machi, Shangence, and more on the way.\n\nThis blog is where we share our thinking and process across product, design, AI and building a company."}',
  'Company',
  '#7c8cff',
  'published',
  now()
)
ON CONFLICT (slug) DO NOTHING;

-- More blog posts (idempotent).
INSERT INTO posts (slug, title, excerpt, body, tag, cover_color, status, published_at)
VALUES
(
  'aesthetics-as-advantage',
  '{"zh":"审美，是一种被低估的竞争力","ja":"美意識は、過小評価された競争力","en":"Aesthetics is an underrated competitive advantage"}',
  '{"zh":"为什么我们把设计放在与工程同样重要的位置。","ja":"なぜ私たちはデザインをエンジニアリングと同じ重みで扱うのか。","en":"Why we treat design as equal in weight to engineering."}',
  '{"zh":"在很多团队里，设计是最后一道工序——功能先做完，再「美化」一下。我们不这么看。\n\n对用户来说，第一眼的质感，就是对产品是否可信的判断。一个排版混乱、间距随意的界面，会让人怀疑背后的工程是否同样草率。审美不是装饰，而是信任的前置条件。\n\n在智希可，设计和工程从第一天就坐在一起。我们在意一个按钮按下去的回弹、一段文字换行的位置、暗色模式下一道阴影的深浅——正是这些看不见的细节，决定了产品「高级」还是「廉价」。\n\n把审美做成肌肉记忆，小团队也能做出让人愿意反复打开的产品。","ja":"多くのチームでは、デザインは最後の工程です——機能を作り終えてから「見た目を整える」。私たちはそう考えません。\n\nユーザーにとって、最初のひと目の質感こそが、プロダクトを信頼できるかの判断材料です。レイアウトが乱れ、余白が雑な画面は、その裏のエンジニアリングも同じく雑ではと疑わせます。美意識は装飾ではなく、信頼の前提条件です。\n\nXICO では、デザインとエンジニアリングは初日から同じ机に座ります。ボタンを押したときの跳ね返り、文章の改行位置、ダークモードでの影の濃さ——こうした見えない細部こそが「高級」か「安っぽい」かを決めます。\n\n美意識を筋肉の記憶にすれば、小さなチームでも、何度も開きたくなるプロダクトをつくれます。","en":"On many teams, design is the last step — build the features, then make it pretty. We don’t see it that way.\n\nFor a user, the quality of that first glance is how they judge whether a product can be trusted. A cluttered layout with careless spacing makes people suspect the engineering behind it is just as careless. Aesthetics aren’t decoration; they’re a precondition for trust.\n\nAt XICO, design and engineering sit at the same table from day one. We care about the spring of a button when it’s pressed, where a line of text wraps, how deep a shadow is in dark mode — these invisible details are exactly what make a product feel premium rather than cheap.\n\nTurn aesthetics into muscle memory, and even a small team can build products people want to open again and again."}',
  'Design',
  '#8b5cf6',
  'published',
  now()
),
(
  'ai-as-leverage',
  '{"zh":"用 AI 创造杠杆：小团队如何做出大产品","ja":"AIでレバレッジを：小さなチームが大きなプロダクトをつくる方法","en":"AI as leverage: how a small team builds big products"}',
  '{"zh":"AI 不是用来取代人，而是放大每个人能做的事。","ja":"AIは人を置き換えるためでなく、一人ひとりができることを増幅するために。","en":"AI is not about replacing people — it is about amplifying what each person can do."}',
  '{"zh":"过去，做一个跨城市、多语言的产品，需要一支很大的团队。今天不一定了。\n\n我们把 AI 当作杠杆：一个人，借助大模型、智能体与自动化，可以完成过去需要一个小组才能完成的事。写文案、做翻译、整理数据、生成初稿、跑评测——这些曾经吃掉大量时间的环节被压缩，把人的精力释放到真正需要判断力的地方。\n\n但杠杆放大的前提，是方向正确。AI 会让对的决定更快兑现，也会让错的决定更快放大。所以我们仍然把「想清楚再做」放在最前面：先定义问题，再让 AI 加速。\n\n这就是我们做 Machi 与 Shangence 的方式——用很小的团队，认真地服务很多人。","ja":"かつて、複数都市・多言語のプロダクトをつくるには、大きなチームが必要でした。今は必ずしもそうではありません。\n\n私たちは AI をレバレッジとして使います。一人が、LLM・エージェント・自動化の力を借りて、かつてはチームが必要だった仕事をこなせます。コピー、翻訳、データ整理、下書き生成、評価——時間を奪っていた工程を圧縮し、人の力を本当に判断が要る場所へ解き放ちます。\n\nただし、レバレッジは方向が正しいことが前提です。AI は正しい判断を速く実現し、誤った判断も速く拡大します。だから私たちは「よく考えてから動く」を最優先にします。まず問題を定義し、それから AI で加速する。\n\nこれが、Machi と Shangence をつくる私たちのやり方です——とても小さなチームで、とても多くの人に、真摯に。","en":"Building a multi-city, multilingual product used to require a large team. Today, not necessarily.\n\nWe treat AI as leverage: one person, with the help of large models, agents and automation, can do what once took a whole group. Copywriting, translation, organizing data, drafting, running evals — the steps that used to eat enormous amounts of time get compressed, freeing human energy for the places that actually need judgment.\n\nBut leverage only helps if the direction is right. AI makes good decisions arrive faster, and bad ones scale faster too. So we still put thinking it through first ahead of everything: define the problem, then let AI accelerate.\n\nThis is how we build Machi and Shangence — a very small team, seriously serving a great many people."}',
  'AI',
  '#0e9f8e',
  'published',
  now()
)
ON CONFLICT (slug) DO NOTHING;

-- More starter roles (idempotent).
INSERT INTO jobs (slug, title, team, location, employment_type, remote, summary, description, requirements, status, sort_order)
VALUES
(
  'ai-engineer',
  '{"zh":"AI 工程师","ja":"AIエンジニア","en":"AI Engineer"}',
  'Engineering',
  '{"zh":"东京 / 长沙 / 远程","ja":"東京 / 長沙 / リモート","en":"Tokyo / Changsha / Remote"}',
  'full_time', true,
  '{"zh":"把大模型、智能体与 RAG 落到 Machi、Shangence 等真实产品里。","ja":"LLM・エージェント・RAG を Machi や Shangence の実プロダクトへ。","en":"Bring LLMs, agents and RAG into real products like Machi and Shangence."}',
  '{"zh":"你将负责 AI 能力的设计与落地：从大模型应用、智能体编排、检索增强到评测与上线。\n\n我们重视真实效果——把前沿能力变成用户真正能用、稳定可靠的功能。","ja":"AI 機能の設計と実装を担当します。LLM アプリ、エージェント、RAG、評価から本番運用まで。\n\n実効性を重視し、最先端を実ユーザーが使える安定した機能に変えます。","en":"You will design and ship AI capabilities — from LLM apps and agent orchestration to retrieval, evals and production.\n\nWe value real impact: turning frontier capability into reliable features users actually use."}',
  '{"zh":["熟悉 LLM 应用 / Agent / RAG 开发","扎实的 Python 或 TypeScript 工程能力","关注效果、评测与可靠性","中文流利，英文或日文加分"],"ja":["LLMアプリ / エージェント / RAG の開発経験","Python または TypeScript の確かな実装力","効果・評価・信頼性へのこだわり","中国語必須、英語または日本語は歓迎"],"en":["Experience with LLM apps / agents / RAG","Strong Python or TypeScript engineering","Care for impact, evals and reliability","Fluent Chinese; English or Japanese a plus"]}',
  'open', 0
),
(
  'growth-overseas',
  '{"zh":"增长与海外运营","ja":"グロース・海外運営","en":"Growth & Overseas Ops"}',
  'Growth',
  '{"zh":"东京 / 远程","ja":"東京 / リモート","en":"Tokyo / Remote"}',
  'full_time', true,
  '{"zh":"负责 Machi 在日本及海外市场的增长与本地化运营。","ja":"Machi の日本・海外市場でのグロースとローカライズ運営を担当。","en":"Drive growth and localized operations for Machi in Japan and overseas."}',
  '{"zh":"你将主导 Machi 在日本起步、并向海外城市扩张的增长与运营：渠道、内容、社区、本地化与合作。\n\n这是一个能把产品真正带到用户面前、跨文化做事的角色。","ja":"Machi の日本での立ち上げと海外都市への拡大を、グロースと運営の両面でリードします。チャネル・コンテンツ・コミュニティ・ローカライズ・提携まで。\n\nプロダクトを実ユーザーに届け、文化を越えて動く役割です。","en":"You will lead Machi''s growth and operations — launching in Japan and expanding to overseas cities: channels, content, community, localization and partnerships.\n\nA role that brings the product to real users, working across cultures."}',
  '{"zh":["有增长 / 运营 / 社区相关经验","日语或英语可工作沟通","熟悉跨境 / 本地化场景","能独立推进、结果导向"],"ja":["グロース / 運営 / コミュニティの経験","日本語または英語でのビジネス会話","越境 / ローカライズの理解","自走できる、結果志向"],"en":["Growth / ops / community experience","Working Japanese or English","Comfort with cross-border / localization","Self-driven and results-oriented"]}',
  'open', 4
),
(
  'product-design-intern',
  '{"zh":"产品 / 设计实习生","ja":"プロダクト・デザイン インターン","en":"Product & Design Intern"}',
  'Design',
  '{"zh":"长沙 / 远程","ja":"長沙 / リモート","en":"Changsha / Remote"}',
  'intern', true,
  '{"zh":"和我们一起做真实的产品，从设计到上线。","ja":"私たちと一緒に、デザインからローンチまで本物のプロダクトを。","en":"Build real products with us — from design to launch."}',
  '{"zh":"你会参与真实产品的设计与打磨，和工程师紧密协作，把想法变成用户能用的体验。\n\n我们给实习生真正的项目，而不是打杂。","ja":"実プロダクトのデザインと磨き込みに関わり、エンジニアと密に協働して、アイデアを使える体験に変えます。\n\nインターンにも雑用ではなく本物のプロジェクトを任せます。","en":"You will work on real product design and polish, collaborating closely with engineers to turn ideas into usable experiences.\n\nWe give interns real projects, not busywork."}',
  '{"zh":["对产品与设计有热情和品味","会用 Figma，了解基本前端更佳","学习能力强、主动","中文流利，英文或日文加分"],"ja":["プロダクトとデザインへの情熱とセンス","Figma が使える、フロント基礎があれば尚可","学習意欲が高く主体的","中国語必須、英語または日本語は歓迎"],"en":["Passion and taste for product and design","Figma skills; basic front-end a plus","Fast learner, proactive","Fluent Chinese; English or Japanese a plus"]}',
  'open', 5
)
ON CONFLICT (slug) DO NOTHING;
