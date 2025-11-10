import { SectionTitle } from '@/components/ui/SectionTitle'
import Button from '@/components/ui/MainButton'
import { useContact } from '@/hooks/useContact'

type ContactFormProps = {
  title?: string
  label?: string
  text?: string
  onSubmit?: (form: { lastName: string; firstName: string; email: string; message: string }) => void
}

const ContactForm = ({
  title = 'FORMULAIRE DE CONTACT',
  label = 'Formulaire',
  text = "Contactez-nous via notre formulaire si vous avez des questions, ou demande spécifique",
  onSubmit,
}: ContactFormProps) => {
  const { sending, status, errorMsg, sendContact } = useContact()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formEl = e.currentTarget
    const formData = new FormData(formEl)
    const payload = {
      lastName: String(formData.get('lastName') || ''),
      firstName: String(formData.get('firstName') || ''),
      email: String(formData.get('email') || ''),
      message: String(formData.get('message') || ''),
    }

    if (onSubmit) {
      onSubmit(payload)
      return
    }

    const res = await sendContact(payload)
    if (res.ok) formEl.reset()
  }

  return (
    <section className="w-full max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 flex flex-col gap-12">
      <SectionTitle label={label} title={title} text={text} />

      {status === 'ok' ? (
        <div className="max-w-3xl mx-auto w-full rounded-xl border border-green-200 bg-green-50 text-green-700 px-4 py-3">
          Votre message a bien été envoyé. Merci, nous vous répondrons rapidement.
        </div>
      ) : null}
      {status === 'error' ? (
        <div className="max-w-3xl mx-auto w-full rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">
          {errorMsg}
        </div>
      ) : null}

      <form className="w-full max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <label htmlFor="lastName" className="text-sm">Nom</label>
          <input id="lastName" name="lastName" type="text" required placeholder="Votre nom" className="h-11 rounded-xl border-2 border-black/20 bg-white/90 px-4 outline-none focus:border-primary" />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="firstName" className="text-sm">Prénom</label>
          <input id="firstName" name="firstName" type="text" required placeholder="Votre prénom" className="h-11 rounded-xl border-2 border-black/20 bg-white/90 px-4 outline-none focus:border-primary" />
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <label htmlFor="email" className="text-sm">Email</label>
          <input id="email" name="email" type="email" required placeholder="votre@email.com" className="h-11 rounded-xl border-2 border-black/20 bg-white/90 px-4 outline-none focus:border-primary" />
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <label htmlFor="message" className="text-sm">Message</label>
          <textarea id="message" name="message" required placeholder="Votre message" rows={6} className="rounded-xl border-2 border-black/20 bg-white/90 p-4 outline-none focus:border-primary" />
        </div>
        <div className="md:col-span-2 flex justify-end">
          <Button label={sending ? 'Envoi...' : 'Envoyer'} size="md" variant="primary" className="w-fit hover:cursor-pointer" disabled={sending} />
        </div>
      </form>
    </section>
  )
}

export default ContactForm


