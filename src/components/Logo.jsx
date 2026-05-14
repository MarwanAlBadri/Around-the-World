import logo from "../assets/logo.svg";
export default function Logo() {
    return (
        <a href="" className="flex gap-3 items-center font-semibold">
            <img src={logo} alt="" />
            Around the World
        </a>
    );
}
