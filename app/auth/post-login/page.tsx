import { redirectAfterLogin } from "@/lib/redirectionafterlogin"

export default async function PostLoginPage() {
  await redirectAfterLogin()
  return null
}
