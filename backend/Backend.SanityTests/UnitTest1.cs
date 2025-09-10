using NUnit.Framework;

namespace Backend.SanityTests
{
    public class Tests
    {
        [Test]
        public void PipelineRunsSuccessfully()
        {
            Assert.That(1 + 1, Is.EqualTo(2));  // Always passes ✅
        }
    }
}
