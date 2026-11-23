import { Button } from '../components/ui';

export default function NotFound() {
  return (
    <section className="section notfound">
      <div className="container center">
        <p className="label">(404)</p>
        <h1 className="display display--xl">
          This room is <em>still being furnished.</em>
        </h1>
        <Button to="/">Return home</Button>
      </div>
    </section>
  );
}
