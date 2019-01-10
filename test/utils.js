/**
 * Helper functions.
 * For any suggestions please contact me at andrei.dimitrief.jianu(at)gmail.com
 */

expectThrow = async (promise, message) => 
{
    try
    {
        await promise;
    }
    catch (err)
    {
        return;
    }

    assert(false, message);
};

expectEvent = async (promise, event, message) => 
{
    try
    {
        let result = await promise;
        for (var i = 0; i < result.logs.length; i++)
        {
            var log = result.logs[i];
            if (log.event === event)
            {
                return;
            }
        }
    }
    catch (err)
    {
        assert(false, message);
    }

    assert(false, message);
};

module.exports = { expectThrow, expectEvent };
