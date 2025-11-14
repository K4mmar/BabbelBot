import React from 'react';

const InfoCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <h3 className="text-xl font-bold text-primary-green mb-3">{title}</h3>
        <div className="space-y-2 text-warm-gray-600">
            {children}
        </div>
    </div>
);

export const AboutScreen: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold text-warm-gray-800 tracking-tight">Over BabbelBot</h1>
                <p className="text-warm-gray-600 mt-2 text-lg">Jouw persoonlijke AI-trainingspartner voor gespreksvaardigheden.</p>
            </div>

            <div className="prose prose-lg max-w-none bg-primary-green-light text-primary-green-dark border-l-4 border-primary-green p-6 rounded-r-xl">
                <h2 className="text-primary-green-dark">Wat is BabbelBot?</h2>
                <p>
                    BabbelBot is een innovatieve trainingsapplicatie, speciaal ontworpen om studenten van de opleiding HBO Social Work te ondersteunen. De app biedt een veilige en interactieve omgeving waarin studenten hun basisgespreksvaardigheden kunnen oefenen met een AI-gestuurde cliënt. Door middel van realistische scenario's en directe, constructieve feedback, helpt BabbelBot de kloof tussen theorie en praktijk te overbruggen.
                </p>
            </div>
            
            <div className="space-y-6">
                <InfoCard title="Doelstelling">
                    <p>De primaire doelstelling van BabbelBot is om studenten een laagdrempelige en veilige oefenomgeving te bieden. Hier kunnen zij zonder prestatiedruk experimenteren met verschillende gesprekstechnieken, hun zelfvertrouwen vergroten en zich beter voorbereiden op de complexe gesprekken die zij in de beroepspraktijk zullen voeren.</p>
                </InfoCard>

                <InfoCard title="Voor Wie?">
                    <p>Deze applicatie is primair ontwikkeld voor <strong>studenten van de opleiding HBO Social Work in Nederland</strong>. Daarnaast kan de tool ook waardevol zijn voor professionals in het veld die hun basisvaardigheden willen opfrissen, of voor studenten van gerelateerde MBO- en HBO-opleidingen in het sociale domein.</p>
                </InfoCard>

                <InfoCard title="Belangrijkste Functies">
                    <ul className="list-disc list-inside space-y-2">
                        <li>
                            <strong>Onderdeel 1: Basistechnieken:</strong> Oefen geïsoleerde gespreksvaardigheden zoals open vragen stellen, parafraseren en gevoelsreflectie. Krijg directe, gerichte feedback na elke poging.
                        </li>
                        <li>
                            <strong>Onderdeel 2: De LSD-methode:</strong> Leer de kern van actief luisteren door de techniek van Luisteren, Samenvatten en Doorvragen toe te passen in begeleide oefeningen en realistische mini-casussen.
                        </li>
                        <li>
                            <strong>Onderdeel 3: Voer het gesprek:</strong> Stel je eigen scenario samen en voer een volledig, ononderbroken gesprek met een AI-cliënt om een hulpvraag te verhelderen. Na afloop ontvang je een uitgebreid rapport.
                        </li>
                        <li>
                            <strong>Dashboard & Rapporten:</strong> Houd je voortgang bij via het persoonlijke dashboard en bekijk opgeslagen rapporten van je eindtoetsen en gesprekken om te reflecteren op je leerproces.
                        </li>
                         <li>
                            <strong>Docentmodus:</strong> Docenten kunnen inloggen om de voortgang van modules te beheren en de AI-feedbackkaders aan te passen aan specifieke leerdoelen of curricula.
                        </li>
                    </ul>
                </InfoCard>
            </div>
        </div>
    );
};