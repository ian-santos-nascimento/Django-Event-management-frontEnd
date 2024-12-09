import {useState, useMemo} from 'react';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import {ComidaType, ConfigOrcamentoWordType, OrcamentoType} from "../types";
// @ts-ignore
import {formatDateToISO} from "../util/utils.ts";
import {ProgressBar} from "react-bootstrap";

interface ConfigOrcamentoWordModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orcamento: OrcamentoType;
    onSubmit: (config: ConfigOrcamentoWordType) => void;
}

export const ConfigOrcamentoWordModal: React.FC<ConfigOrcamentoWordModalProps> = ({
                                                                                      open,
                                                                                      onOpenChange,
                                                                                      orcamento,
                                                                                      onSubmit
                                                                                  }) => {
    const INTERVALO_TIPOS = [
        "Intervalo_manha",
        "Intervalo_almoco",
        "Intervalo_tarde"
    ];

    const eventDates = useMemo(() => {
        const startDate = new Date(formatDateToISO(orcamento.evento.data_inicio));
        const endDate = new Date(formatDateToISO(orcamento.evento.data_fim));
        const dates: string[] = [];

        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            dates.push(currentDate.toISOString().split('T')[0]);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dates;
    }, [orcamento.evento.data_inicio, orcamento.evento.data_fim]);

    const [currentStep, setCurrentStep] = useState(0);
    const [selectedFoods, setSelectedFoods] = useState<ConfigOrcamentoWordType["data"]>(() => {
        return eventDates.reduce((acc, date) => {
            acc[date] = INTERVALO_TIPOS.reduce((intervalAcc, intervalo) => {
                intervalAcc[intervalo] = {comidas: []};
                return intervalAcc;
            }, {} as { [intervalo: string]: { comidas: ComidaType[] } });
            return acc;
        }, {} as ConfigOrcamentoWordType["data"]);
    });

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const updateSelectedFoods = (
        date: string,
        intervalType: string,
        comida: ComidaType,
        checked: boolean
    ) => {
        setSelectedFoods(prev => {
            const updatedFoods = {...prev};

            if (checked) {
                if (!updatedFoods[date][intervalType].comidas.some(c => c.comida_id === comida.comida_id)) {
                    updatedFoods[date][intervalType].comidas.push(comida);
                }
            } else {
                updatedFoods[date][intervalType].comidas = updatedFoods[date][intervalType].comidas.filter(
                    c => c.comida_id !== comida.comida_id
                );
            }

            return updatedFoods;
        });
    };

    const handleSubmit = () => {
        onSubmit({
            orcamento,
            data: selectedFoods
        });
        onOpenChange(false);
    };

    const renderStepContent = () => {
        const currentDate = eventDates[currentStep];

        return (
            <Modal.Body>
                <div className="text-center mb-4">
                    <h4>Configurar Cardápio - Dia {currentStep + 1}</h4>
                    <ProgressBar
                        now={((currentStep + 1) * 100) / (eventDates.length + 1)}
                        label={`${currentStep + 1}/${eventDates.length}`}
                    />
                    <p className="mt-2">{formatDate(currentDate)}</p>
                </div>

                {INTERVALO_TIPOS.map((intervalType) => (
                    <div key={intervalType} className="mb-4">
                        <h5 className="mb-3 text-center">
                            {intervalType === 'Intervalo_manha'
                                ? 'Intervalo Manhã'
                                : intervalType === 'Intervalo_almoco'
                                    ? 'Intervalo Almoço'
                                    : 'Intervalo Tarde'}
                        </h5>
                        <div
                            style={{
                                maxHeight: '300px', // Altura máxima para ativar o scroll
                                overflowY: 'auto',
                                border: '1px solid #ccc', // Para destacar o contêiner scrollável
                                padding: '10px',
                                borderRadius: '5px',
                            }}
                        >
                                {orcamento.comidas.map((cardapio) => (
                                    <Col key={cardapio.comida_id} md={4} className="mb-2">
                                        <Form.Check
                                            type="checkbox"
                                            id={`food-${currentStep}-${intervalType}-${cardapio.comida_id}`}
                                            label={cardapio.comida}
                                            checked={selectedFoods[currentDate][intervalType].comidas.some(
                                                (c) => c.comida_id === cardapio.comida_id
                                            )}
                                            onChange={(e) =>
                                                updateSelectedFoods(
                                                    currentDate,
                                                    intervalType,
                                                    {
                                                        comida_id: cardapio.comida_id,
                                                        nome: cardapio.comida,
                                                        descricao: '',
                                                        valor: cardapio.valor,
                                                        quantidade_minima: 1,
                                                        fator_multiplicador: 1,
                                                        tipo: '',
                                                        subtipo: '',
                                                    },
                                                    e.target.checked
                                                )
                                            }
                                        />
                                    </Col>
                                ))}
                        </div>
                    </div>
                ))}
            </Modal.Body>
        );
    };

    const renderFooter = () => (
        <Modal.Footer>
            <div className="d-flex justify-content-between w-100">
                {currentStep > 0 && (
                    <Button
                        variant="secondary"
                        onClick={() => setCurrentStep(currentStep - 1)}
                    >
                        Voltar
                    </Button>
                )}

                {currentStep < eventDates.length - 1 ? (
                    <Button
                        variant="primary"
                        onClick={() => setCurrentStep(currentStep + 1)}
                    >
                        Próximo Dia
                    </Button>
                ) : (
                    <Button
                        variant="success"
                        onClick={handleSubmit}
                    >
                        Gerar Documento
                    </Button>
                )}
            </div>
        </Modal.Footer>
    );

    return (
        <Modal
            show={open}
            onHide={() => onOpenChange(false)}
            size="xl"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    Configurar Cardápio para Documento
                </Modal.Title>
            </Modal.Header>

            {renderStepContent()}
            {renderFooter()}
        </Modal>
    );
};

export default ConfigOrcamentoWordModal;