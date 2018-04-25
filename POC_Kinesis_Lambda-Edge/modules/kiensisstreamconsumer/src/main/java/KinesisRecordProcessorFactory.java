import com.amazonaws.services.kinesis.clientlibrary.interfaces.IRecordProcessor;
import com.amazonaws.services.kinesis.clientlibrary.interfaces.IRecordProcessorFactory;

public class KinesisRecordProcessorFactory implements IRecordProcessorFactory {
    /**
     * Constructor.
     */
    public KinesisRecordProcessorFactory() {
        super();
    }
    /**
     * {@inheritDoc}
     */
    @Override
    public IRecordProcessor createProcessor() {
        return new KinesisRecordProcessor();
    }
}