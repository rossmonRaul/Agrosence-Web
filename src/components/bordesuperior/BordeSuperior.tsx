import '../../css/BodeSuperior.css'


interface BorderProps {
    text: string;
};

const BordeSuperior: React.FC<BorderProps> = ({ text }) => {

    return (
        <div className="top-border">
            <p>{text}</p>
        </div>
    );
};

export default BordeSuperior;
