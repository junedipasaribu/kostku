import PageTransition from "@/components/ui/page-transition";

export default function LoginTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransition>{children}</PageTransition>;
}
