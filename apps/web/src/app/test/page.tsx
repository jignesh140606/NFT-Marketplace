export default function TestPage() {
  return (
    <div>
      <h1>Test Page</h1>
      <p>If you see this, Next.js is working!</p>
      <p>Contract Address: {process.env.NEXT_PUBLIC_COURSE_COMPLETION_NFT_ADDRESS}</p>
    </div>
  );
}