import { PageShell } from '@/components/PageShell';
import { PixelCard } from '@/components/PixelCard';
import { SharkMascot } from '@/components/SharkMascot';

export default function EditorPage() {
  return (
    <PageShell>
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <section className="pixel-card rounded-3xl p-6">
          <h1 className="mb-5 text-3xl font-black">写作编辑器 / WRITING</h1>
          <input placeholder="请输入文章标题（必填）" className="mb-4 w-full rounded-xl border-2 border-ocean-800/20 bg-white px-4 py-4 text-xl font-bold outline-none focus:border-coral" />
          <div className="mb-4 flex flex-wrap gap-2 rounded-xl border-2 border-ocean-800/20 bg-white/70 p-2 text-sm font-bold"><button>段落</button><button>B</button><button>I</button><button>{'</>'}</button><button>引用</button><button>列表</button><button>图片</button><button>预览</button></div>
          <textarea placeholder="在这里开始写作吧...\n支持 Markdown 语法" className="min-h-[520px] w-full rounded-2xl border-2 border-ocean-800/20 bg-white/70 p-5 outline-none focus:border-coral" />
          <div className="mt-5 flex justify-end gap-3"><button className="rounded-xl border-2 border-ocean-800/25 px-5 py-3 font-black">保存草稿</button><button className="rounded-xl bg-coral px-5 py-3 font-black text-white shadow-pixel">发布文章</button></div>
        </section>
        <aside className="space-y-4"><PixelCard><h2 className="font-black">预览 / PREVIEW</h2><div className="mt-4 rounded-2xl bg-ocean-100 p-3"><SharkMascot variant="laptop" /></div></PixelCard><PixelCard><h2 className="mb-3 font-black">写作小贴士 / TIPS</h2><ul className="list-disc space-y-2 pl-5 text-sm text-slate-600"><li>使用 Markdown 提升写作效率</li><li>合理使用标题层级 H1-H3</li><li>为图片添加描述和替代文本</li><li>发布前预览效果更准确</li></ul></PixelCard></aside>
      </div>
    </PageShell>
  );
}
