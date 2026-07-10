/**
 * Layout for the Xico Clean product site (/mac and children).
 *
 * The product pages are dark-first ("honest precision instrument" art
 * direction, shared with the app itself): a scoped `.mac-theme` re-declares
 * every design token to the aurora-dark palette regardless of the company
 * site's light/dark toggle, and `.mac-canvas` paints the ink-black gradient
 * canvas. The header/footer add the same scope class themselves because they
 * render outside this subtree.
 */
export default function MacLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mac-theme mac-canvas min-h-screen text-foreground">
      {/* Keep the page edges (overscroll, scrollbar, form controls) dark on
          product routes only — this layout renders nowhere else. */}
      <style>{`html:has(.mac-theme){color-scheme:dark}body:has(.mac-theme){background-color:#07080f}`}</style>
      {children}
    </div>
  );
}
