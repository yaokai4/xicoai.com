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
  '{"zh":"你将参与希可旗下产品从 0 到 1 的开发，覆盖前端、后端、数据库与基础设施。\n\n我们重视真实运营——你写的代码会直接服务真实用户，并和支付、后台、安全等环节连成完整的产品。","ja":"XICO のプロダクトを 0→1 で開発し、フロント・バックエンド・DB・インフラまで担当します。\n\n実運用を重視します。あなたのコードは実ユーザーに届き、決済・管理画面・セキュリティまで一つのプロダクトとしてつながります。","en":"You will build XICO products from 0 to 1 across front-end, back-end, database and infrastructure.\n\nWe value real operations — your code reaches real users and connects with payments, admin and security as one complete product."}',
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
  '{"zh":"以设计驱动的方式，定义希可产品的品牌、界面与体验。","ja":"デザイン主導で、XICO プロダクトのブランド・UI・体験を定義する。","en":"Define the brand, interface and experience of XICO products in a design-led way."}',
  '{"zh":"你将主导产品的视觉与交互设计，从品牌到界面，把审美变成产品真正的竞争力。\n\n我们相信设计与工程同等重要，你会和工程师紧密协作，把设计落到真实可用的产品里。","ja":"プロダクトのビジュアルとインタラクション設計をリードし、ブランドから UI まで、美意識を競争力に変えます。\n\nデザインとエンジニアリングは同等に重要だと考えています。エンジニアと密に協働し、実際に使えるプロダクトへ落とし込みます。","en":"You will lead the visual and interaction design of our products — turning aesthetics into real competitive edge, from brand to interface.\n\nWe treat design and engineering as equals; you will work closely with engineers to ship design into real, usable products."}',
  '{"zh":["出色的视觉与交互设计能力","熟练使用 Figma 等工具","理解前端实现与设计系统","有完整产品设计作品集"],"ja":["優れたビジュアル / インタラクション設計力","Figma などのツールに習熟","フロント実装とデザインシステムの理解","プロダクトデザインのポートフォリオ"],"en":["Strong visual and interaction design skills","Fluent with Figma and similar tools","Understanding of front-end and design systems","A portfolio of complete product design work"]}',
  'open',
  2
)
ON CONFLICT (slug) DO NOTHING;
